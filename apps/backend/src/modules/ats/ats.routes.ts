
import { Router } from "express";
import { analyzeResumeController } from "./ats.controller";
import { resumeUpload } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/analyze",
  resumeUpload.single("resume"),
  analyzeResumeController,
);

export default router;
