import { z } from "zod";

export const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    slug: z.string().min(1, "Category slug is required"),
    description: z.string().optional().default(""),
    image: z.string().optional().default(""),
    isActive: z.boolean().optional().default(true),
  }),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const categoryUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
  }).strict(),
  query: z.object({}).strict(),
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
});

export const categoryQuerySchema = z.object({
  body: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional(),
    search: z.string().optional(),
  }),
  params: z.object({}).strict(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>["body"];
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>["body"];
