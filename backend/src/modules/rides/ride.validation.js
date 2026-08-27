import { z } from "zod";

export const createRideSchema = z.object({
  pickupAddress: z
    .string()
    .trim()
    .min(2, "Pickup address is too short")
    .max(255, "Pickup address is too long"),

  pickupLatitude: z
    .number()
    .min(-90, "Invalid pickup latitude")
    .max(90, "Invalid pickup latitude"),

  pickupLongitude: z
    .number()
    .min(-180, "Invalid pickup longitude")
    .max(180, "Invalid pickup longitude"),

  dropoffAddress: z
    .string()
    .trim()
    .min(2, "Dropoff address is too short")
    .max(255, "Dropoff address is too long"),

  dropoffLatitude: z
    .number()
    .min(-90, "Invalid dropoff latitude")
    .max(90, "Invalid dropoff latitude"),

  dropoffLongitude: z
    .number()
    .min(-180, "Invalid dropoff longitude")
    .max(180, "Invalid dropoff longitude"),
});
