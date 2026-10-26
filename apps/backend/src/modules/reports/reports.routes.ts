import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getATSReportsController,
  getInterviewReportsController,
  getReportStatsController,
  getReportDetailsController,
  deleteReportController,
} from "./reports.controller";

const router = Router();

// Secure all user reports routes
router.use(authenticate);

router.get("/ats", getATSReportsController);
router.get("/interviews", getInterviewReportsController);
router.get("/stats", getReportStatsController);
router.get("/:type/:id", getReportDetailsController);
router.delete("/:type/:id", deleteReportController);

export default router;
