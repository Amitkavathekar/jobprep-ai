import { Router } from "express";
import {
  getAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  toggleAdminPlanStatus,
  deleteAdminPlan,
} from "./plan.controller";

const router = Router();

router.get("/", getAdminPlans);
router.post("/", createAdminPlan);
router.put("/:id", updateAdminPlan);
router.patch("/:id/status", toggleAdminPlanStatus);
router.delete("/:id", deleteAdminPlan);

export default router;
