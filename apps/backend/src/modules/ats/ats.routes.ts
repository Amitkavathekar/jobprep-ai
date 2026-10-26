
import { Router } from "express";
import { analyzeResumeController } from "./ats.controller";
import { resumeUpload } from "../../middlewares/upload.middleware";
import { optionalAuthenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/analyze",
  optionalAuthenticate,
  resumeUpload.single("resume"),
  analyzeResumeController,
);

export default router;
