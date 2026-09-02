import { z } from "zod";

export const productCreateSchema = z.object({
  body: z.object({
    sku: z.string().min(1, "SKU is required"),
    category: z.string().min(1, "Category is required"),
    productName: z.string().min(1, "Product name is required"),
    material: z.string().optional(),
    availableSizes: z.array(z.string()).optional().default([]),
    colours: z.array(z.string()).optional().default([]),
    wholesalePrice: z.number().positive("Wholesale price must be positive"),
    mrp: z.number().positive("MRP must be positive"),
    sellingPrice: z.number().positive("Selling price must be positive"),
    description: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
    stock: z.number().nonnegative("Stock cannot be negative").default(0),
    isActive: z.boolean().optional().default(true),
  }),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const productUpdateSchema = z.object({
  body: z.object({
    sku: z.string().min(1, "SKU is required").optional(),
    category: z.string().min(1, "Category is required").optional(),
    productName: z.string().min(1, "Product name is required").optional(),
    material: z.string().optional(),
    availableSizes: z.array(z.string()).optional(),
    colours: z.array(z.string()).optional(),
    wholesalePrice: z.number().positive().optional(),
    mrp: z.number().positive().optional(),
    sellingPrice: z.number().positive().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    stock: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }).strict(),
  query: z.object({}).strict(),
  params: z.object({
    id: z.string().min(1, "Product ID is required"),
  }),
});

export const productQuerySchema = z.object({
  body: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    size: z.string().optional(),
    colour: z.string().optional(),
    sort: z.enum(["asc", "desc", "newest", "popular"]).optional(),
  }),
  params: z.object({}).strict(),
});

export const productByIdSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: z.object({
    id: z.string().min(1, "Product ID is required"),
  }),
});

export const productBySkuSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: z.object({
    sku: z.string().min(1, "SKU is required"),
  }),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>["body"];
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>["body"];
export type ProductQueryInput = z.infer<typeof productQuerySchema>["query"];
