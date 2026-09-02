import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { getEnv } from "../config/env.js";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const env = getEnv();

  console.error("Error:", {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [`Duplicate ${field}`],
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      errors: ["Invalid ID"],
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response: any = {
    success: false,
    message,
  };

  if (env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
