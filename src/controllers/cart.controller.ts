import { Request, Response } from "express";
import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

interface AuthRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req: AuthRequest): string => {
  const authenticatedUserId =
    req.user?.id ||
    req.user?._id;

  if (!authenticatedUserId) {
    throw new Error("Authentication required");
  }

  return authenticatedUserId;
};

// =====================================================
// GET CART
// =====================================================

export const getCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(500).json({
        success: false,
        message: "Invalid cart user",
      });
    }

    console.log(
      "[Cart] GET cart for user:",
      userId
    );

    const cart = await Cart.findOne({
      user: userId,
    })
      .populate("items.product")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data:
        cart || {
          user: userId,
          items: [],
        },
    });
  } catch (error) {
    console.error(
      "[Cart] get cart error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// =====================================================
// ADD ITEM TO CART
// =====================================================

export const addItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    // IMPORTANT:
    // Android sends:
    // productId
    // quantity
    // size
    // colour
    //
    // Backend Cart model uses:
    // selectedSize
    // selectedColour

    const {
      productId,
      quantity = 1,
      size: selectedSize,
      colour: selectedColour,
    } = req.body;

    console.log("========================================");
    console.log("[Cart] ADD ITEM");
    console.log("userId:", userId);
    console.log("productId:", productId);
    console.log("quantity:", quantity);
    console.log("selectedSize:", selectedSize);
    console.log("selectedColour:", selectedColour);
    console.log("========================================");

    // =================================================
    // USER ID
    // =================================================

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(500).json({
        success: false,
        message: "Invalid cart user",
      });
    }

    // =================================================
    // PRODUCT ID
    // =================================================

    if (
      !productId ||
      !mongoose.isValidObjectId(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    // =================================================
    // QUANTITY
    // =================================================

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // =================================================
    // FIND PRODUCT
    // =================================================

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
      });

    if (!product) {
      console.log(
        "[Cart] Product not found:",
        productId
      );

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(
      "[Cart] Product:",
      product.productName
    );

    console.log(
      "[Cart] Stock:",
      product.stock
    );

    // =================================================
    // STOCK CHECK
    // =================================================

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // =================================================
    // SIZE VALIDATION
    // =================================================

    if (
      selectedSize !== undefined &&
      selectedSize !== null &&
      product.availableSizes?.length > 0 &&
      !product.availableSizes.includes(
        selectedSize
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected size is not available",
      });
    }

    // =================================================
    // COLOUR VALIDATION
    // =================================================

    if (
      selectedColour !== undefined &&
      selectedColour !== null &&
      product.colours?.length > 0 &&
      !product.colours.includes(
        selectedColour
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected colour is not available",
      });
    }

    // =================================================
    // FIND CART
    // =================================================

    let cart =
      await Cart.findOne({
        user: userId,
      });

    // =================================================
    // CREATE CART
    // =================================================

    if (!cart) {
      console.log(
        "[Cart] Creating new cart for:",
        userId
      );

      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // =================================================
    // FIND SAME PRODUCT + SAME VARIANT
    // =================================================

    const existingItem =
      cart.items.find(
        (item) =>
          item.product.toString() ===
            productId &&
          (item.selectedSize ?? null) ===
            (selectedSize ?? null) &&
          (item.selectedColour ?? null) ===
            (selectedColour ?? null)
      );

    // =================================================
    // EXISTING ITEM
    // =================================================

    if (existingItem) {
      const newQuantity =
        existingItem.quantity +
        quantity;

      console.log(
        "[Cart] Existing item found"
      );

      console.log(
        "[Cart] Old quantity:",
        existingItem.quantity
      );

      console.log(
        "[Cart] Requested quantity:",
        quantity
      );

      console.log(
        "[Cart] New quantity:",
        newQuantity
      );

      if (
        newQuantity >
        product.stock
      ) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      existingItem.quantity =
        newQuantity;

    } else {

      // =================================================
      // NEW ITEM
      // =================================================

      console.log(
        "[Cart] Adding new product variant"
      );

      cart.items.push({
        product:
          new mongoose.Types.ObjectId(
            productId
          ),
        quantity,
        selectedSize:
          selectedSize ?? null,
        selectedColour:
          selectedColour ?? null,
      });
    }

    // =================================================
    // SAVE
    // =================================================

    await cart.save();

    console.log(
      "[Cart] Cart saved successfully"
    );

    // =================================================
    // POPULATE
    // =================================================

    await cart.populate(
      "items.product"
    );

    console.log(
      "[Cart] Total cart items:",
      cart.items.length
    );

    return res.status(200).json({
      success: true,
      message:
        "Item added to cart successfully",
      data: cart,
    });

  } catch (error: any) {

    console.error(
      "========================================"
    );

    console.error(
      "[Cart] ADD ITEM ERROR"
    );

    console.error(error);

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to add item to cart",
    });
  }
};

// =====================================================
// UPDATE CART ITEM
// =====================================================

export const updateItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      getUserId(req);

    const {
      itemId,
    } = req.params;

    const {
      quantity,
      size,
      colour,
      selectedSize,
      selectedColour,
    } = req.body;

    const finalSize =
      size !== undefined
        ? size
        : selectedSize;

    const finalColour =
      colour !== undefined
        ? colour
        : selectedColour;

    if (
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(500).json({
        success: false,
        message: "Invalid cart user",
      });
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be at least 1",
      });
    }

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found",
      });
    }

    const item =
      cart.items.find(
        (cartItem) =>
          cartItem.product.toString() ===
          itemId
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Cart item not found",
      });
    }

    const product =
      await Product.findById(
        item.product
      );

    if (
      !product ||
      !product.isActive
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    if (
      quantity >
      product.stock
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient stock",
      });
    }

    item.quantity =
      quantity;

    if (
      finalSize !== undefined
    ) {
      item.selectedSize =
        finalSize;
    }

    if (
      finalColour !== undefined
    ) {
      item.selectedColour =
        finalColour;
    }

    await cart.save();

    await cart.populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      message:
        "Cart item updated successfully",
      data: cart,
    });

  } catch (error) {

    console.error(
      "[Cart] update item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update cart item",
    });
  }
};

// =====================================================
// REMOVE CART ITEM
// =====================================================

export const removeItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      getUserId(req);

    const {
      itemId,
    } = req.params;

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found",
      });
    }

    const oldLength =
      cart.items.length;

    cart.items =
      cart.items.filter(
        (item) =>
          item.product.toString() !==
          itemId
      );

    if (
      cart.items.length ===
      oldLength
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Cart item not found",
      });
    }

    await cart.save();

    await cart.populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      message:
        "Item removed from cart successfully",
      data: cart,
    });

  } catch (error) {

    console.error(
      "[Cart] remove item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove cart item",
    });
  }
};

// =====================================================
// CLEAR CART
// =====================================================

export const clearCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      getUserId(req);

    const cart =
      await Cart.findOneAndUpdate(
        {
          user: userId,
        },
        {
          $set: {
            items: [],
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Cart cleared successfully",
      data: cart,
    });

  } catch (error) {

    console.error(
      "[Cart] clear cart error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to clear cart",
    });
  }
};