import { Router } from "express";
import {
  analyzeController,
  getLatestAnalysisController,
} from "./ai-analysis.controller";
import { resumeUpload } from "../../middlewares/upload.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/analyze",
  authenticate,
  resumeUpload.single("resume"),
  analyzeController,
);

router.get("/latest", authenticate, getLatestAnalysisController);

export default router;
