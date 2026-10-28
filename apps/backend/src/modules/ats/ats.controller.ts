
import type { Request, Response, NextFunction } from "express";
import { analyzeResume } from "./ats.service";
import { AtsAnalysesCombinedReport } from "../reports/ats-analysis-combined-report.model";
import { logUserActivity } from "../users/user-activity.service";

export async function analyzeResumeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;
    const resumeText = (req.body.resumeText || req.body.content || req.body.text || "") as string;

    if (!file && (!resumeText || resumeText.trim().length < 15)) {
      res.status(400).json({
        success: false,
        message: "Please upload a resume file or provide resume text to analyze.",
      });
      return;
    }

    const analysis = await analyzeResume(
      file || resumeText.trim(),
      req.body.targetJobRole,
      req.body.jobDescription,
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

        await logUserActivity(
          userId,
          "ats_scan",
          `ATS Compatibility Scan: ${analysis.targetJobRole} (${analysis.score}/100)`,
          `Evaluated ${analysis.targetJobRole} application with ${analysis.matchedSkills?.length || 0} matched skills`,
          { score: analysis.score, role: analysis.targetJobRole }
        );
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
