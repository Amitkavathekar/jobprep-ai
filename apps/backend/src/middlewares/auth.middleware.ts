
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/utils/jwt.utils";
import { HTTP_STATUS } from "../constants/http-status";

// Required authentication
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    const user = verifyToken(token);

    (req as any).user = user;

    return next();
  } catch {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


