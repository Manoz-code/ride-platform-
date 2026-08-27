import { Router } from "express";

import {
  getMyRiderProfile,
  updateMyAvailability,
} from "./rider.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/me",
  requireAuth,
  requireRole("rider"),
  getMyRiderProfile
);

router.patch(
  "/availability",
  requireAuth,
  requireRole("rider"),
  updateMyAvailability
);

export default router;