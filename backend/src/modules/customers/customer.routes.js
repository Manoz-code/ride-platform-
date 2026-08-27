import { Router } from "express";

import { getMyCustomerProfile } from "./customer.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, getMyCustomerProfile);

export default router;
