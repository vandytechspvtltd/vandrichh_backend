import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(1, "Address name is required"),
  phone: z.string().min(10, "Phone is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  landmark: z.string().optional(),
});

export const orderCreateSchema = z.object({
  body: z.object({
    shippingAddress: addressSchema,
    paymentMethod: z.enum(["COD"]),
  }),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const orderStatusUpdateSchema = z.object({
  body: z.object({
    orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  }),
  query: z.object({}).strict(),
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

export const orderQuerySchema = z.object({
  body: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional(),
    status: z.string().optional(),
  }),
  params: z.object({}).strict(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>["body"];
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>["body"];
