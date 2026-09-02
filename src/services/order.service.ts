import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { calculatePagination, formatPaginationResponse } from "../utils/pagination.js";
import type { OrderCreateInput, OrderStatusUpdateInput } from "../validators/order.validator.js";

const DELIVERY_FEE = 50;

export class OrderService {
  async create(userId: string, input: OrderCreateInput) {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    let subtotal = 0;
    const items: any[] = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product as any;

      if (!product.isActive) {
        throw new ApiError(400, `Product ${product.productName} is no longer available`);
      }

      if (product.stock < cartItem.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.productName}`);
      }

      const itemSubtotal = product.sellingPrice * cartItem.quantity;
      subtotal += itemSubtotal;

      items.push({
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
        price: product.sellingPrice,
        subtotal: itemSubtotal,
      });

      // Reduce stock
      product.stock -= cartItem.quantity;
      await product.save();
    }

    const totalAmount = subtotal + DELIVERY_FEE;

    const order = new Order({
      user: userId,
      items,
      shippingAddress: input.shippingAddress,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      totalAmount,
      paymentMethod: input.paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    return order;
  }

  async getMyOrders(userId: string, page?: number, limit?: number) {
    const { skip, limit: limitNum, page: pageNum } = calculatePagination(page || 1, limit || 10);

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments({ user: userId });

    return formatPaginationResponse(orders, pageNum, limitNum, total);
  }

  async getById(id: string, userId?: string) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (userId && order.user.toString() !== userId) {
      throw new ApiError(403, "Unauthorized");
    }

    return order;
  }

  async getAllOrders(page?: number, limit?: number) {
    const { skip, limit: limitNum, page: pageNum } = calculatePagination(page || 1, limit || 10);

    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments();

    return formatPaginationResponse(orders, pageNum, limitNum, total);
  }

  async updateStatus(id: string, input: OrderStatusUpdateInput) {
    const order = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: input.orderStatus,
        paymentStatus: input.paymentStatus,
      },
      { new: true }
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }
}

export const orderService = new OrderService();
