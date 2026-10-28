import type { Request, Response, NextFunction } from "express";
import { analyzeJdAndResume, getLatestAnalysis } from "./ai-analysis.service";
import { generateInterviewPrep } from "../Interview-Prep/interview-prep.service";
import { logUserActivity } from "../users/user-activity.service";

export async function analyzeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: "Please upload a PDF, DOCX, or TXT resume file.",
      });
      return;
    }

    const jobDescription = req.body.jobDescription || req.body.job_description || "";
    if (typeof jobDescription !== "string" || jobDescription.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: "Job description is required and must be at least 10 characters long.",
      });
      return;
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to analyze resume.",
      });
      return;
    }

    const result = await analyzeJdAndResume(file, jobDescription.trim(), userId);

    try {
      const fileName = file.originalname || "Resume";
      const score = typeof result.score === "number" ? result.score : 0;
      await logUserActivity(
        userId,
        "ai_analysis",
        `AI Resume Analysis: ${fileName} (${score}% Match)`,
        `Analyzed against target job requirements`,
        { score, fileName }
      );
    } catch {}

    // Automatically generate tailored Interview Prep questions & answers during Step 2
    try {
      await generateInterviewPrep(userId);
      await logUserActivity(
        userId,
        "interview_prep",
        `Generated Tailored Interview Question Bank`,
        `Curated domain-specific Q&As and personalized study plan`,
        { role: (result as any).targetJobRole }
      );
    } catch (prepErr) {
      console.warn("Interview prep generation warning during Step 2 validation:", prepErr);
    }

    res.status(200).json({
      success: true,
      message: "Resume & Job Description analyzed and Interview Prep generated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLatestAnalysisController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to retrieve analysis.",
      });
      return;
    }

    const result = await getLatestAnalysis(userId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "No previous analysis found for this user.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
