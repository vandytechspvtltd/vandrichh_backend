import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRequest } from "../utils/helpers.js";
import { Admin } from "../models/admin.model.js";

export function authMiddleware(req: ApiRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No authorization token provided");
    }

    const token = authHeader.substring(7);
    const env = getEnv();

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      userRole: "CUSTOMER" | "ADMIN";
    };

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid or expired token"));
    } else if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Authentication failed"));
    }
  }
}

export function adminMiddleware(req: ApiRequest, res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN") {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
}

export async function requireAdmin(req: ApiRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Admin authorization token required");
    }

    const env = getEnv();
    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      env.ADMIN_JWT_SECRET || env.JWT_SECRET
    ) as { adminId?: string; type?: string };

    if (decoded.type !== "admin-access" || !decoded.adminId) {
      throw new ApiError(403, "Admin access required");
    }

    const admin = await Admin.findById(decoded.adminId).select("role isActive").lean();

    if (!admin || !admin.isActive) {
      throw new ApiError(403, "Admin account is inactive or unavailable");
    }

    req.adminId = admin._id.toString();
    req.adminRole = admin.role;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid or expired admin token"));
    }

    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(401, "Admin authentication failed"));
  }
}
