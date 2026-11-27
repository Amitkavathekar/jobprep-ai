import { Request, Response, NextFunction } from "express";
import {
  sendResetPasswordOtp,
  verifyResetOtp,
  resetPassword,
} from "./forgot-password.service";
import { HTTP_STATUS } from "@/constants/http-status";

export const sendOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await sendResetPasswordOtp(req.body);
    return res.status(HTTP_STATUS.OK).json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await verifyResetOtp(req.body);
    return res.status(HTTP_STATUS.OK).json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await resetPassword(req.body);
    return res.status(HTTP_STATUS.OK).json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

