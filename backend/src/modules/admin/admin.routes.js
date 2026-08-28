
import { Router } from "express";

import {
  approveRiderProfile,
  approveVehicleProfile,
  getPendingRiderApprovals,
  getPendingVehicleApprovals,
} from "./admin.controller.js";

import {
  createFareRuleController,
  getFareRulesController,
  getFareRuleController,
  updateFareRuleController,
} from "./fare-rule.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/riders/pending",
  requireAuth,
  requireRole("admin"),
  getPendingRiderApprovals
);

router.patch(
  "/riders/:riderId/approve",
  requireAuth,
  requireRole("admin"),
  approveRiderProfile
);

router.get(
  "/vehicles/pending",
  requireAuth,
  requireRole("admin"),
  getPendingVehicleApprovals
);

router.patch(
  "/vehicles/:vehicleId/approve",
  requireAuth,
  requireRole("admin"),
  approveVehicleProfile
);

router.post(
  "/fare-rules",
  requireAuth,
  requireRole("admin"),
  createFareRuleController
);

router.get(
  "/fare-rules",
  requireAuth,
  requireRole("admin"),
  getFareRulesController
);

router.get(
  "/fare-rules/:id",
  requireAuth,
  requireRole("admin"),
  getFareRuleController
);

router.patch(
  "/fare-rules/:id",
  requireAuth,
  requireRole("admin"),
  updateFareRuleController
);

export default router;
