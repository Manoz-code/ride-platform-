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

import {
  getMyAvailableRides,
  acceptMyRide,
  startMyRide,
  completeMyRide,
  cancelMyRide,
} from "./rider-ride.controller.js";

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

// Rider ride management

router.get(
  "/rides",
  requireAuth,
  requireRole("rider"),
  getMyAvailableRides
);

router.patch(
  "/rides/:rideId/accept",
  requireAuth,
  requireRole("rider"),
  acceptMyRide
);

router.patch(
  "/rides/:rideId/start",
  requireAuth,
  requireRole("rider"),
  startMyRide
);

router.patch(
  "/rides/:rideId/complete",
  requireAuth,
  requireRole("rider"),
  completeMyRide
);

router.patch(
  "/rides/:rideId/cancel",
  requireAuth,
  requireRole("rider"),
  cancelMyRide
);

export default router;