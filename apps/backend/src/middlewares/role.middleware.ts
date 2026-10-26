import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || (user.role && !roles.includes(user.role))) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
      });
      return;
    }
    next();
  };
};
