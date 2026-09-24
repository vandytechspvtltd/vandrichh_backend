import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRequest } from "../utils/helpers.js";
import { getEnv } from "../config/env.js";

const sanitizeAdmin = (admin: any) => {
  const value = admin.toObject ? admin.toObject() : { ...admin };
  delete value.passwordHash;
  return value;
};

export const login = async (req: Request, res: Response) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email }).select("+passwordHash");
  if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new ApiError(401, "Invalid admin email or password");
  }

  const env = getEnv();
  const token = jwt.sign(
    { adminId: admin._id.toString(), role: admin.role, type: "admin-access" },
    env.ADMIN_JWT_SECRET || env.JWT_SECRET,
    { expiresIn: env.ADMIN_JWT_EXPIRES_IN }
  );

  return res.status(200).json({
    success: true,
    message: "Admin login successful",
    data: { admin: sanitizeAdmin(admin), token },
  });
};

export const me = async (req: ApiRequest, res: Response) => {
  const admin = await Admin.findById(req.adminId).lean();
  if (!admin) throw new ApiError(404, "Admin not found");

  return res.status(200).json({
    success: true,
    message: "Admin profile fetched successfully",
    data: sanitizeAdmin(admin),
  });
};