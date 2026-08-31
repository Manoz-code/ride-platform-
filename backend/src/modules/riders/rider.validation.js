import { z } from "zod";

export const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(["offline", "online", "busy"]),
});

export const rideIdParamSchema = z.object({
  rideId: z.string().uuid("Invalid ride ID"),
});
