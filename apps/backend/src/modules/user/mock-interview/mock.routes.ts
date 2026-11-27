import { Router } from "express";
import {
  getTargetRoleController,
  chatWithAlexController,
  evaluateAnswerController,
  generateQuestionsController,
  generateScorecardController,
  getMockInterviewsController,
} from "./mock.controller";
import { authenticate } from "../../../middlewares/auth.middleware";

const router = Router();

// Protect mock interview endpoints with authentication
router.use(authenticate);

router.get("/",  getMockInterviewsController);
router.get("/target-role", getTargetRoleController);
router.post("/chat",  chatWithAlexController);
router.post("/evaluate-answer", evaluateAnswerController);
router.post("/generate-questions",  generateQuestionsController);
router.post("/scorecard",  generateScorecardController);

export default router;
