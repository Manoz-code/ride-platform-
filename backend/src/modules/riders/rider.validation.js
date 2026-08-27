import { z } from "zod";

export const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(["offline", "online", "busy"]),
});
