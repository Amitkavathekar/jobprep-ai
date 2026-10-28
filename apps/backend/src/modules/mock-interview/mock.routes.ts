import { Router } from "express";
import { optionalAuthenticate } from "../../middlewares/auth.middleware";
import {
  getTargetRoleController,
  chatWithAlexController,
  evaluateAnswerController,
  generateQuestionsController,
  generateScorecardController,
} from "./mock.controller";

const router = Router();

router.get("/target-role", optionalAuthenticate, getTargetRoleController);
router.post("/chat", optionalAuthenticate, chatWithAlexController);
router.post("/evaluate-answer", optionalAuthenticate, evaluateAnswerController);
router.post("/generate-questions", optionalAuthenticate, generateQuestionsController);
router.post("/scorecard", optionalAuthenticate, generateScorecardController);

export default router;
