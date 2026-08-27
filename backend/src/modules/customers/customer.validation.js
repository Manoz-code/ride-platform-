import { z } from "zod";

export const updateCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(100, "Name is too long"),
});
