import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getEnv } from "../config/env.js";
import type { AuthLoginInput, AuthRegisterInput } from "../validators/auth.validator.js";

export class AuthService {
  async register(input: AuthRegisterInput) {
    const existing = await User.findOne({
      $or: [{ email: input.email }, { phone: input.phone }],
    });

    if (existing) {
      throw new ApiError(409, "Email or phone already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = new User({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: "CUSTOMER",
    });

    await user.save();

    const token = this.generateToken(user._id.toString(), user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  async login(input: AuthLoginInput) {
    const user = await User.findOne({ email: input.email }).select("+passwordHash");

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = this.generateToken(user._id.toString(), user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async updateProfile(userId: string, updates: { name?: string; phone?: string }) {
    if (updates.phone) {
      const existing = await User.findOne({ phone: updates.phone, _id: { $ne: userId } });
      if (existing) {
        throw new ApiError(409, "Phone already registered");
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  private generateToken(userId: string, role: "CUSTOMER" | "ADMIN"): string {
    const env = getEnv();
    return jwt.sign({ userId, userRole: role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }
}

export const authService = new AuthService();
