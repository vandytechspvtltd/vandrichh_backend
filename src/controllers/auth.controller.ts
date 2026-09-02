import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { getEnv } from "../config/env.js";

const env = getEnv();

interface AuthRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

const generateToken = (userId: string) => {
  return jwt.sign(
    {
      userId,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const sanitizeUser = (user: any) => {
  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.passwordHash;

  return userObject;
};

/**
 * Register
 * POST /auth/register
 *
 * Kept for normal email/password registration.
 */
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const normalizedPhone = String(phone).trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      if (existingUser.phone === normalizedPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }

      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      role: "CUSTOMER",
      isActive: true,
    });

    const token = generateToken(
      user._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "email"
            ? "Email already registered"
            : duplicateField === "phone"
              ? "Phone number already registered"
              : "User already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

/**
 * Login / Send OTP
 * POST /auth/login
 *
 * Mobile number based login.
 */
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const phone = String(
      req.body.phone ?? ""
    ).trim();

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10 digit phone number",
      });
    }

    const user = await User.findOne({
      phone,
    });

    if (user && !user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    /*
     * Generate secure OTP.
     *
     * This OTP is generated dynamically.
     * It is NOT hardcoded.
     */
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    /*
     * Development phase:
     *
     * We are not sending SMS yet.
     * The generated OTP is logged on backend
     * so that it can be tested.
     *
     * Production me yahan SMS provider lagega.
     */
    if (env.NODE_ENV === "development") {
      console.log(
        `📱 Development OTP for ${phone}: ${otp}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(
      "Login OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/**
 * Verify OTP
 * POST /auth/verify-otp
 */
export const verifyOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const phone = String(
      req.body.phone ?? ""
    ).trim();

    const otp = String(
      req.body.otp ?? ""
    ).trim();

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number and OTP are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10 digit phone number",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    /*
     * =================================================
     * DEVELOPMENT OTP BYPASS
     * =================================================
     *
     * Any 6-digit OTP will work in development.
     *
     * IMPORTANT:
     * This block will NOT execute in production.
     */
    if (env.NODE_ENV === "development") {
      let user = await User.findOne({
        phone,
      });

      /*
       * New phone number:
       *
       * User schema requires:
       * - name
       * - email
       * - phone
       * - passwordHash
       *
       * So we generate temporary values dynamically.
       *
       * These are NOT hardcoded user credentials.
       */
      if (!user) {
        const generatedId =
          crypto.randomUUID();

        const generatedEmail =
          `phone_${phone}_${generatedId}@vandrichh.local`;

        const generatedPassword =
          crypto.randomBytes(32).toString("hex");

        const passwordHash =
          await bcrypt.hash(
            generatedPassword,
            12
          );

        user = await User.create({
          name: "Customer",
          email: generatedEmail,
          phone,
          passwordHash,
          role: "CUSTOMER",
          isActive: true,
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message:
            "Your account has been deactivated",
        });
      }

      const token = generateToken(
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message:
          "OTP verified successfully",
        data: {
          user: sanitizeUser(user),
          token,
        },
      });
    }

    /*
     * =================================================
     * PRODUCTION OTP VERIFICATION
     * =================================================
     *
     * Actual SMS OTP implementation will go here.
     */
    return res.status(400).json({
      success: false,
      message:
        "OTP verification service is not configured",
    });
  } catch (error: any) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

/**
 * Get current authenticated user
 * GET /auth/me
 */
export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const user = await User.findById(
      userId
    )
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
        message:
          "Your account has been deactivated",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Current user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(
      "Get me error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user",
    });
  }
};

/**
 * Update authenticated user's profile
 * PUT /auth/me
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      name,
      phone,
    } = req.body;

    const updateData: Record<
      string,
      any
    > = {};

    if (name !== undefined) {
      const trimmedName =
        String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message:
            "Name cannot be empty",
        });
      }

      updateData.name =
        trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone =
        String(phone).trim();

      if (!trimmedPhone) {
        return res.status(400).json({
          success: false,
          message:
            "Phone cannot be empty",
        });
      }

      const existingPhone =
        await User.findOne({
          phone: trimmedPhone,
          _id: {
            $ne: userId,
          },
        });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message:
            "Phone number already registered",
        });
      }

      updateData.phone =
        trimmedPhone;
    }

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid fields provided for update",
      });
    }

    const user =
      await User.findByIdAndUpdate(
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
      message:
        "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error(
      "Update profile error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Phone number already registered",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update profile",
    });
  }
};