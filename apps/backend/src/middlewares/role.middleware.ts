import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/http-status";


export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || (user.role && !roles.includes(user.role))) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
      });
      return;
    }
    next();
  };
};
