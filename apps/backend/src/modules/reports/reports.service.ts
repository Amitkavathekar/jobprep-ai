import { Types } from "mongoose";
import { AtsAnalysesCombinedReport } from "./ats-analysis-combined-report.model";
import { MockInterviewsReport } from "./mock-interview-report.model";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  minScore?: number;
}

export async function getUserATSReports(
  userId: string,
  options: PaginationOptions = {}
) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    user_id: new Types.ObjectId(userId),
  };

  if (options.search && options.search.trim()) {
    const searchRegex = new RegExp(options.search.trim(), "i");
    query.$or = [
      { target_job_role: searchRegex },
      { company: searchRegex },
      { matched_skills: searchRegex },
    ];
  }

  if (typeof options.minScore === "number" && !isNaN(options.minScore)) {
    query.overall_match_score = { $gte: options.minScore };
  }

  const [items, total] = await Promise.all([
    AtsAnalysesCombinedReport.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AtsAnalysesCombinedReport.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getUserInterviewReports(
  userId: string,
  options: PaginationOptions = {}
) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    user_id: new Types.ObjectId(userId),
  };

  if (options.search && options.search.trim()) {
    const searchRegex = new RegExp(options.search.trim(), "i");
    query.$or = [
      { role: searchRegex },
      { interview_type: searchRegex },
    ];
  }

  if (typeof options.minScore === "number" && !isNaN(options.minScore)) {
    query.score = { $gte: options.minScore };
  }

  const [items, total] = await Promise.all([
    MockInterviewsReport.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MockInterviewsReport.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getUserReportStats(userId: string) {
  const userObjectId = new Types.ObjectId(userId);

  const [atsReports, interviewReports] = await Promise.all([
    AtsAnalysesCombinedReport.find({ user_id: userObjectId })
      .select("overall_match_score created_at")
      .lean(),
    MockInterviewsReport.find({ user_id: userObjectId })
      .select("score created_at")
      .lean(),
  ]);

  const totalScans = atsReports.length;
  const avgMatchScore =
    totalScans > 0
      ? Math.round(
          atsReports.reduce((acc, curr) => acc + (curr.overall_match_score || 0), 0) /
            totalScans
        )
      : 0;

  const totalInterviews = interviewReports.length;
  const avgInterviewScore =
    totalInterviews > 0
      ? Math.round(
          interviewReports.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            totalInterviews
        )
      : 0;

  return {
    totalScans,
    avgMatchScore,
    totalInterviews,
    avgInterviewScore,
  };
}

export async function getATSReportById(userId: string, reportId: string) {
  if (!Types.ObjectId.isValid(reportId)) return null;

  return AtsAnalysesCombinedReport.findOne({
    _id: new Types.ObjectId(reportId),
    user_id: new Types.ObjectId(userId),
  }).lean();
}

export async function getInterviewReportById(userId: string, reportId: string) {
  if (!Types.ObjectId.isValid(reportId)) return null;

  return MockInterviewsReport.findOne({
    _id: new Types.ObjectId(reportId),
    user_id: new Types.ObjectId(userId),
  }).lean();
}

export async function deleteReportById(
  userId: string,
  reportType: "ats" | "interview",
  reportId: string
) {
  if (!Types.ObjectId.isValid(reportId)) return false;

  const userObjectId = new Types.ObjectId(userId);
  const targetId = new Types.ObjectId(reportId);

  if (reportType === "ats") {
    const result = await AtsAnalysesCombinedReport.deleteOne({
      _id: targetId,
      user_id: userObjectId,
    });
    return result.deletedCount > 0;
  }

  const result = await MockInterviewsReport.deleteOne({
    _id: targetId,
    user_id: userObjectId,
  });
  return result.deletedCount > 0;
}
