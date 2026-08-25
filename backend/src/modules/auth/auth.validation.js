import { z } from "zod";

export const registerSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),

  fullName: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(100, "Name is too long"),

  role: z
    .enum(["customer", "rider"])
    .default("customer"),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});
