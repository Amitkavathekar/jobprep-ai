import type { Request, Response, NextFunction } from "express";
import {
  getActivityLogsService,
  createActivityLogService,
  getOrCreateCategory,
} from "./activity-log.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// Re-export getOrCreateCategory for backward compatibility
export { getOrCreateCategory };

// GET /api/admin/activity-logs
export const getActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const formatted = await getActivityLogsService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Activity logs fetched successfully",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/activity-logs
export const createActivityLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await createActivityLogService(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Activity log recorded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
