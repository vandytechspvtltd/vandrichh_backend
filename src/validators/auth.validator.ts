import { z } from "zod";

export const authRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const authLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export type AuthRegisterInput = z.infer<typeof authRegisterSchema>["body"];
export type AuthLoginInput = z.infer<typeof authLoginSchema>["body"];
