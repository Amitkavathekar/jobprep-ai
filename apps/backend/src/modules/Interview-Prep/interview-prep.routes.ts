import { Router } from "express";
import {
  getInterviewPrepController,
  regenerateInterviewPrepController,
} from "./interview-prep.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getInterviewPrepController);
router.post("/generate", authenticate, regenerateInterviewPrepController);

export default router;
