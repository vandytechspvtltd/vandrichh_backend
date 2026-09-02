import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRequest } from "../utils/helpers.js";

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
