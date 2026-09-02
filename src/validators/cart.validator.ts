import { z } from "zod";

export const cartAddItemSchema = z.object({
  body: z.object({
    product: z.string().min(1, "Product ID is required"),
    quantity: z.number().positive("Quantity must be at least 1"),
    selectedSize: z.string().optional(),
    selectedColour: z.string().optional(),
  }),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const cartUpdateItemSchema = z.object({
  body: z.object({
    quantity: z.number().positive("Quantity must be at least 1"),
    selectedSize: z.string().optional(),
    selectedColour: z.string().optional(),
  }),
  query: z.object({}).strict(),
  params: z.object({
    productId: z.string().min(1, "Product ID is required"),
  }),
});

export type CartAddItemInput = z.infer<typeof cartAddItemSchema>["body"];
export type CartUpdateItemInput = z.infer<typeof cartUpdateItemSchema>["body"];
