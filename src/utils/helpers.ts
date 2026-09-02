import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.js";
import { ZodError } from "zod";

export interface ApiRequest extends Request {
  userId?: string;
  userRole?: "CUSTOMER" | "ADMIN";
}

export type AsyncHandler = (req: ApiRequest, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: ApiRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Handler error:", err);
      next(err);
    });
  };
}

export function validateZod(schema: any) {
  return (req: ApiRequest, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        next(new ApiError(400, "Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
}
