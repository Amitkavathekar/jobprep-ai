import { Router } from "express";
import {
  getTargetRoleController,
  chatWithAlexController,
  evaluateAnswerController,
  generateQuestionsController,
  generateScorecardController,
  getMockInterviewsController,
} from "./mock.controller";

const router = Router();

router.get("/",  getMockInterviewsController);
router.get("/target-role", getTargetRoleController);
router.post("/chat",  chatWithAlexController);
router.post("/evaluate-answer", evaluateAnswerController);
router.post("/generate-questions",  generateQuestionsController);
router.post("/scorecard",  generateScorecardController);

export default router;
