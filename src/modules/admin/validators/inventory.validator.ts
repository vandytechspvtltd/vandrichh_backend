import { z } from "zod";

export const inventoryValidator = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().int().min(0).default(0),
  reserved: z.number().int().min(0).default(0),
  location: z.string().default("warehouse"),
  status: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).default("IN_STOCK"),
});

export const inventoryUpdateValidator = inventoryValidator.partial();
