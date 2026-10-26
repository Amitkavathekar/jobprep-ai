
import type { Request, Response, NextFunction } from "express";
import { analyzeResume } from "./ats.service";
import { AtsAnalysesCombinedReport } from "../reports/ats-analysis-combined-report.model";

export async function analyzeResumeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX resume.",
      });
      return;
    }

    const analysis = await analyzeResume(
      file,
      req.body.targetJobRole,
    );

    let savedReportId: string | undefined = undefined;

    const userId = (req as any).user?.id;
    if (userId) {
      try {
        const saved = await AtsAnalysesCombinedReport.create({
          user_id: userId,
          target_job_role: analysis.targetJobRole,
          company: req.body.company?.trim() || "Target Role Application",
          overall_match_score: analysis.score,
          ats_parse_score: analysis.score,
          matched_skills: analysis.matchedSkills,
          missing_keywords: analysis.missingSkills,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations,
          raw_summary: analysis.summary,
        });
        savedReportId = saved._id.toString();
      } catch (err) {
        console.error("Failed to persist ATS analysis report to history:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: {
        ...analysis,
        reportId: savedReportId,
      },
    });
  } catch (error) {
    next(error);
  }
}
