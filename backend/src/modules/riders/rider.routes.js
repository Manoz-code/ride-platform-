
import { Router } from "express";

import {
  getMyRiderProfile,
  updateMyAvailability,
} from "./rider.controller.js";

import {
  getMyVehicles,
  addMyVehicle,
  updateMyVehicle,
} from "./vehicle.controller.js";

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

router.get(
  "/vehicles",
  requireAuth,
  requireRole("rider"),
  getMyVehicles
);

router.post(
  "/vehicles",
  requireAuth,
  requireRole("rider"),
  addMyVehicle
);

router.patch(
  "/vehicles/:vehicleId",
  requireAuth,
  requireRole("rider"),
  updateMyVehicle
);

export default router;
