import { z } from "zod";

export const couponValidator = z.object({
  code: z.string().min(3, "Coupon code is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  value: z.number().min(0).default(0),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().min(0).default(0),
  expiresAt: z.string().nullable().optional(),
});

export const couponUpdateValidator = couponValidator.partial();
