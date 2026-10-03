import { Request, Response } from "express";

import { reviewService } from "../services/review.service.js";
import { reviewValidator, reviewUpdateValidator } from "../validators/review.validator.js";

export const listReviews = async (req: Request, res: Response) => {
  const productId = typeof req.query.productId === "string" ? req.query.productId : undefined;
  const reviews = await reviewService.list(productId);
  return res.json({ success: true, message: "Reviews fetched successfully", data: reviews });
};

export const createReview = async (req: Request, res: Response) => {
  const payload = reviewValidator.parse(req.body);
  const review = await reviewService.create({
    ...payload,
    userId: (req as any).user?._id || (req as any).userId || "customer",
  });
  return res.status(201).json({ success: true, message: "Review created successfully", data: review });
};

export const updateReview = async (req: Request, res: Response) => {
  const payload = reviewUpdateValidator.parse(req.body);
  const review = await reviewService.update(req.params.id, payload);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  return res.json({ success: true, message: "Review updated successfully", data: review });
};

export const deleteReview = async (req: Request, res: Response) => {
  const review = await reviewService.remove(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  return res.json({ success: true, message: "Review deleted successfully", data: review });
};
