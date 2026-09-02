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

// =====================================================
// GET CURRENT USER PROFILE
// GET /user/profile
// =====================================================

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

// =====================================================
// UPDATE CURRENT USER PROFILE
// PUT /user/profile
// =====================================================

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

// =====================================================
// GET CURRENT USER ADDRESSES
// GET /user/addresses
// =====================================================

export const getAddresses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    console.log(
      `[Addresses] GET request for user: ${userId || "unknown"}`
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        data: [],
      });
    }

    const user = await User.findById(userId)
      .select("addresses")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: [],
      });
    }

    const addresses = (user.addresses || []).map(
      (address: any) => ({
        id: address._id?.toString() || "",
        fullName: address.name || "",
        phone: address.phone || "",
        street: address.addressLine1 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        isDefault: Boolean(address.isDefault),
      })
    );

    console.log(
      `[Addresses] Found ${addresses.length} addresses for user ${userId}`
    );

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      data: [],
    });
  }
};

// =====================================================
// ADD CURRENT USER ADDRESS
// POST /user/addresses
// =====================================================

export const addAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    console.log(
      `[Addresses] POST request for user: ${userId || "unknown"}`
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        data: [],
      });
    }

    const {
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault = false,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!String(fullName || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
        data: [],
      });
    }

    if (!String(phone || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
        data: [],
      });
    }

    if (!String(street || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Street address is required",
        data: [],
      });
    }

    if (!String(city || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
        data: [],
      });
    }

    if (!String(state || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "State is required",
        data: [],
      });
    }

    if (!String(pincode || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
        data: [],
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: [],
      });
    }

    // -------------------------------------------------
    // DEFAULT ADDRESS HANDLING
    // -------------------------------------------------

    const shouldBeDefault =
      Boolean(isDefault) || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    // -------------------------------------------------
    // SAVE ADDRESS
    // Backend schema:
    // name
    // phone
    // addressLine1
    // addressLine2
    // city
    // state
    // pincode
    // landmark
    // isDefault
    // -------------------------------------------------

    user.addresses.push({
      name: String(fullName).trim(),
      phone: String(phone).trim(),
      addressLine1: String(street).trim(),
      addressLine2: "",
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      landmark: "",
      isDefault: shouldBeDefault,
    });

    await user.save();

    // -------------------------------------------------
    // RETURN ANDROID-COMPATIBLE RESPONSE
    // -------------------------------------------------

    const addresses = user.addresses.map(
      (address: any) => ({
        id: address._id?.toString() || "",
        fullName: address.name || "",
        phone: address.phone || "",
        street: address.addressLine1 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        isDefault: Boolean(address.isDefault),
      })
    );

    console.log(
      `[Addresses] Address added successfully for user ${userId}`
    );

    console.log(
      `[Addresses] Total addresses: ${addresses.length}`
    );

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: addresses,
    });
  } catch (error: any) {
    console.error("Add address error:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Failed to add address",
      data: [],
    });
  }
};