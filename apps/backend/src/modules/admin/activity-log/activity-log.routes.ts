import { Router } from "express";
import {
  getActivityLogs,
  createActivityLog,
} from "./activity-log.controller";

const router = Router();

router.get("/", getActivityLogs);
router.post("/", createActivityLog);

export default router;
