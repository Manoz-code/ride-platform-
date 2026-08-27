import { z } from "zod";

export const createVehicleSchema = z.object({
  type: z.enum(["bike", "car"]),
  plateNumber: z
    .string()
    .trim()
    .min(1, "Plate number is required")
    .max(30, "Plate number is too long"),
  brand: z
    .string()
    .trim()
    .max(100, "Brand is too long")
    .optional()
    .nullable(),
  model: z
    .string()
    .trim()
    .max(100, "Model is too long")
    .optional()
    .nullable(),
});

export const updateVehicleSchema = z.object({
  type: z.enum(["bike", "car"]).optional(),
  plateNumber: z
    .string()
    .trim()
    .min(1, "Plate number cannot be empty")
    .max(30, "Plate number is too long")
    .optional(),
  brand: z
    .string()
    .trim()
    .max(100, "Brand is too long")
    .optional()
    .nullable(),
  model: z
    .string()
    .trim()
    .max(100, "Model is too long")
    .optional()
    .nullable(),
  status: z
    .enum(["active", "inactive", "suspended"])
    .optional(),
});
