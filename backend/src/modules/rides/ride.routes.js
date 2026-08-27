import { Router } from "express";
import {
  requestRide,
  getMyRides,
  getMyRideById,
  cancelMyRide,
} from "./ride.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("customer"),
  requestRide
);

router.get(
  "/",
  requireAuth,
  requireRole("customer"),
  getMyRides
);

router.get(
  "/:id",
  requireAuth,
  requireRole("customer"),
  getMyRideById
);

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("customer"),
  cancelMyRide
);


export default router;
