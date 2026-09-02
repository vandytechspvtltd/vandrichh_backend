import { Request, Response } from "express";
import mongoose from "mongoose";

import { Order, OrderStatus } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

interface AuthRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

const getUserId = (req: AuthRequest) =>
  req.user?.id || req.user?._id;

export const create = async (
  req: AuthRequest,
  res: Response
) => {
  const session = await mongoose.startSession();

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Only COD payment is currently supported",
      });
    }

    let createdOrder: any;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({
        user: userId,
      }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderItems: any[] = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findOne({
          _id: cartItem.product,
          isActive: true,
        }).session(session);

        if (!product) {
          throw new Error(
            `Product ${cartItem.product} not found`
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new Error(
            `Insufficient stock for ${product.productName}`
          );
        }

        const price = product.sellingPrice;
        const itemSubtotal = price * cartItem.quantity;

        orderItems.push({
          product: product._id,
          productSnapshot: {
            sku: product.sku,
            productName: product.productName,
            sellingPrice: product.sellingPrice,
            images: product.images,
          },
          quantity: cartItem.quantity,
          selectedSize: cartItem.selectedSize,
          selectedColour: cartItem.selectedColour,
          price,
          subtotal: itemSubtotal,
        });

        subtotal += itemSubtotal;

        product.stock -= cartItem.quantity;
        await product.save({ session });
      }

      const deliveryFee = 0;
      const totalAmount = subtotal + deliveryFee;

      const orders = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            deliveryFee,
            totalAmount,
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            orderStatus: "PENDING",
          },
        ],
        { session }
      );

      createdOrder = orders[0];

      cart.items = [];
      await cart.save({ session });
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (error: any) {
    console.error("create order error:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Failed to create order",
    });
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    console.log("========== GET MY ORDERS ==========");
    console.log("Authenticated user:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        data: [],
      });
    }

    const orders = await Order.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate("items.product")
      .lean();

    console.log(`Orders found: ${orders.length}`);

    orders.forEach((order: any, index: number) => {
      console.log(
        `Order ${index + 1}: ${order._id} | ${order.orderNumber} | ${order.orderStatus}`
      );
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      data: [],
    });
  }
};
export const getOrderById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId,
    })
      .populate("items.product")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const getAllOrders = async (
  _req: Request,
  res: Response
) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone role")
      .populate("items.product")
      .lean();

    return res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const updateStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          orderStatus,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};