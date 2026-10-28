import type { Request, Response, NextFunction } from "express";
import {
  getMockInterviewTargetRole,
  chatWithAlex,
  evaluateAnswerWithGroq,
  generateDynamicQuestionsWithGroq,
  generateMockScorecardWithGroq,
} from "./mock.service";
import { logUserActivity } from "../users/user-activity.service";

export async function getTargetRoleController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const localJd = (req.query.localJd as string) || (req.query.resumeId as string);
    const data = await getMockInterviewTargetRole(userId, localJd);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function chatWithAlexController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { message, history, targetRole, category } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, message: "A message string is required." });
      return;
    }

    const data = await chatWithAlex({ message, history, targetRole, category });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function evaluateAnswerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { question, category, hint, answer, difficulty, roleTitle } = req.body;
    if (!question) {
      res.status(400).json({ success: false, message: "Question is required." });
      return;
    }

    const data = await evaluateAnswerWithGroq({
      userId,
      question,
      category,
      hint,
      answer: answer || "",
      difficulty,
      roleTitle,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function generateQuestionsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { category, count = 10, difficulty = "Medium", roleTitle, jdText, resumeId, resumeText, localJd } = req.body;

    const result = await generateDynamicQuestionsWithGroq({
      userId,
      category: category || "Theory & Core Concepts",
      count: Number(count) || 10,
      difficulty,
      roleTitle,
      jdText: jdText || localJd,
      resumeId,
      resumeText,
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateScorecardController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { interviewType, difficulty, questions, answers, roleTitle } = req.body;

    const data = await generateMockScorecardWithGroq({
      interviewType: interviewType || "Mock Interview",
      difficulty: difficulty || "Medium",
      questions: Array.isArray(questions) ? questions : [],
      answers: Array.isArray(answers) ? answers : [],
      roleTitle,
      userId,
    });

    if (userId) {
      try {
        const score = (data as any)?.overallScore || (data as any)?.score || 0;
        await logUserActivity(
          userId,
          "mock_interview",
          `Completed Mock Interview: ${interviewType || "Practice Session"} (${score}%)`,
          `Practiced ${Array.isArray(questions) ? questions.length : 0} questions for ${roleTitle || "Target Role"}`,
          { score, interviewType, roleTitle }
        );
      } catch {}
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
