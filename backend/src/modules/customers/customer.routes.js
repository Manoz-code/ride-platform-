import { Router } from "express";

import {
  getMyCustomerProfile,
  updateMyCustomerProfile,
} from "./customer.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, getMyCustomerProfile);
router.patch("/me", requireAuth, updateMyCustomerProfile);

export default router;
