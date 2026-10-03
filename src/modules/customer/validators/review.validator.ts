import { z } from "zod";

export const reviewValidator = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5).default(5),
  title: z.string().min(1, "Review title is required").optional(),
  comment: z.string().min(1, "Review comment is required"),
  isApproved: z.boolean().default(true).optional(),
});

export const reviewUpdateValidator = reviewValidator.partial();
