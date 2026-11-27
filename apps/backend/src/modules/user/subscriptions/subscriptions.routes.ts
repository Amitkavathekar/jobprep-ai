import { Router } from "express";
import { getAdminPlans } from "../../admin/plan/plan.controller";

const router = Router();

// GET /api/subscriptions/plans
router.get("/plans", getAdminPlans);

export default router;
