import type { Request, Response, NextFunction } from "express";
import {
  getAtsConfigService,
  getInterviewTypesService,
} from "./ats-interview-config.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// GET /api/admin/ats-config
export const getAtsConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAtsConfigService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "ATS dictionary rules fetched from MongoDB",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/interview-types
export const getInterviewTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getInterviewTypesService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Interview types fetched from MongoDB",
      data,
    });
  } catch (error) {
    next(error);
  }
};
