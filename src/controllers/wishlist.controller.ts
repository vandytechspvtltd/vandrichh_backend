import mongoose from "mongoose";
import { Request, Response } from "express";

import { Wishlist } from "../models/wishlist.model.js";

interface AuthRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

const getUserId = (req: AuthRequest): string | undefined => {
  return req.user?.id || req.user?._id;
};

// =====================================================
// GET Wishlist
// GET /api/v1/wishlist
// =====================================================

export const getWishlist = async (
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

    let wishlist = await Wishlist.findOne({
      user: userId,
    })
      .populate("products")
      .lean();

    // Create empty wishlist for new user
    if (!wishlist) {
      const newWishlist = await Wishlist.create({
        user: userId,
        products: [],
      });

      return res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        data: {
          _id: newWishlist._id,
          user: newWishlist.user,
          products: [],
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: {
        ...wishlist,
        items: wishlist.products || [],
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// =====================================================
// Toggle Wishlist
// POST /api/v1/wishlist/:productId
// =====================================================

export const toggleWishlist = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const productObjectId =
      new mongoose.Types.ObjectId(productId);

    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    // =====================================================
    // Create wishlist if user doesn't have one
    // =====================================================

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productObjectId],
      });

      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        data: {
          ...wishlist.toObject(),
          items: wishlist.products,
        },
      });
    }

    // =====================================================
    // Check whether product already exists
    // =====================================================

    const productExists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    // =====================================================
    // Remove product
    // =====================================================

    if (productExists) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
    }

    // =====================================================
    // Add product
    // =====================================================

    else {
      wishlist.products.push(productObjectId);
    }

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: productExists
        ? "Product removed from wishlist"
        : "Product added to wishlist",
      data: {
        ...wishlist.toObject(),
        items: wishlist.products,
      },
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
    });
  }
};