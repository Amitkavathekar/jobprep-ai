import mongoose from "mongoose";
import { UserActivity } from "./user-activity.model";
import { AtsAnalysesCombinedReport } from "../reports/ats-analysis-combined-report.model";
import { AiAnalysis } from "../ai-analysis/ai-analysis.model";

export async function logUserActivity(
  userId: string | mongoose.Types.ObjectId,
  type: string,
  title: string,
  description?: string,
  metadata?: Record<string, any>
) {
  try {
    if (!userId) return null;
    const uid = new mongoose.Types.ObjectId(userId.toString());
    return await UserActivity.create({
      user_id: uid,
      type,
      title,
      description: description || "",
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Failed to log user activity:", error);
    return null;
  }
}

export async function getUserActivities(userId: string | mongoose.Types.ObjectId, limit = 10) {
  try {
    if (!userId) return [];
    const uid = new mongoose.Types.ObjectId(userId.toString());

    let activities = await UserActivity.find({ user_id: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // If this user has no activities yet, check if they have past ATS or AI analysis reports
    // and backfill recent entries automatically for this user
    if (!activities || activities.length === 0) {
      const seeded: any[] = [];

      try {
        const atsReports = await AtsAnalysesCombinedReport.find({ user_id: uid })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        for (const rep of atsReports) {
          const act = await UserActivity.create({
            user_id: uid,
            type: "ats_scan",
            title: `ATS Compatibility Scan: ${rep.target_job_role} (${rep.overall_match_score}/100)`,
            description: `Evaluated ${rep.target_job_role} application with ${rep.matched_skills?.length || 0} matched skills`,
            metadata: { score: rep.overall_match_score, role: rep.target_job_role },
            createdAt: (rep as any).createdAt || new Date(),
          });
          seeded.push(act);
        }
      } catch {}

      try {
        const latestAi = await AiAnalysis.findOne({ user_id: uid })
          .sort({ createdAt: -1 })
          .lean();

        if (latestAi) {
          const fileName = (latestAi as any).resume_file_name || (latestAi as any).parsed_resume?.fileName || "Uploaded Resume";
          const score = (latestAi as any).match_score || 0;
          const act = await UserActivity.create({
            user_id: uid,
            type: "ai_analysis",
            title: `AI Resume Analysis: ${fileName} (${score}% Match)`,
            description: `Evaluated resume compatibility for target position`,
            metadata: { score, fileName },
            createdAt: (latestAi as any).createdAt || new Date(),
          });
          seeded.push(act);
        }
      } catch {}

      if (seeded.length > 0) {
        activities = await UserActivity.find({ user_id: uid })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
      }
    }

    return activities;
  } catch (error) {
    console.error("Failed to retrieve user activities:", error);
    return [];
  }
}
