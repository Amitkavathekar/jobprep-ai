import { Router } from "express";
import {
  listResumesController,
  getResumeByIdController,
  createResumeController,
  updateResumeController,
  deleteResumeController,
  togglePinResumeController,
  duplicateResumeController,
  uploadResumeController,
} from "./resume.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { resumeUpload } from "../../middlewares/upload.middleware";

const router = Router();

// All resume routes are protected by authentication middleware
router.use(authenticate);

router.get("/", listResumesController);
router.post("/", createResumeController);
router.post("/upload", resumeUpload.single("resume"), uploadResumeController);
router.get("/:id", getResumeByIdController);
router.put("/:id", updateResumeController);
router.delete("/:id", deleteResumeController);
router.patch("/:id/pin", togglePinResumeController);
router.post("/:id/duplicate", duplicateResumeController);

export default router;
