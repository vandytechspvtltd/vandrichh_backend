import { Request, Response } from "express";
import { User } from "../models/user.model.js";

interface AuthRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

const getUserId = (req: AuthRequest): string | undefined => {
  return req.user?.id || req.user?._id;
};

/**
 * Get current user's profile
 * GET /user/profile
 */
export const getProfile = async (
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

    const user = await User.findById(userId)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/**
 * Update current user's profile
 * PUT /user/profile
 */
export const updateProfile = async (
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

    const {
      name,
      phone,
    } = req.body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      updateData.name = trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();

      if (!trimmedPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone cannot be empty",
        });
      }

      const existingUser = await User.findOne({
        phone: trimmedPhone,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }

      updateData.phone = trimmedPhone;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Failed to update profile",
    });
  }
};