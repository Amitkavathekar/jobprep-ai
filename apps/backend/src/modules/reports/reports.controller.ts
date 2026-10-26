import { Request, Response, NextFunction } from "express";
import {
  getUserATSReports,
  getUserInterviewReports,
  getUserReportStats,
  getATSReportById,
  getInterviewReportById,
  deleteReportById,
} from "./reports.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function getATSReportsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || "";
    const minScore = req.query.minScore
      ? parseInt(req.query.minScore as string, 10)
      : undefined;

    const data = await getUserATSReports(userId, {
      page,
      limit,
      search,
      minScore,
    });

    res.status(200).json({
      success: true,
      message: "ATS reports retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewReportsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || "";
    const minScore = req.query.minScore
      ? parseInt(req.query.minScore as string, 10)
      : undefined;

    const data = await getUserInterviewReports(userId, {
      page,
      limit,
      search,
      minScore,
    });

    res.status(200).json({
      success: true,
      message: "Interview reports retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportStatsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const stats = await getUserReportStats(userId);

    res.status(200).json({
      success: true,
      message: "Report statistics retrieved successfully.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportDetailsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
    const reportId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let report: unknown = null;

    if (type === "ats") {
      report = await getATSReportById(userId, reportId);
    } else if (type === "interview") {
      report = await getInterviewReportById(userId, reportId);
    } else {
      res.status(400).json({ success: false, message: "Invalid report type." });
      return;
    }

    if (!report) {
      res.status(404).json({ success: false, message: "Report not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Report details retrieved successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReportController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
    const reportId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (type !== "ats" && type !== "interview") {
      res.status(400).json({ success: false, message: "Invalid report type." });
      return;
    }

    const deleted = await deleteReportById(userId, type, reportId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Report not found or not authorized to delete.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Report deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
