import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/utils/jwt.utils";

export const authenticate = (req: Request,res: Response,
   next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  try {
    const user = verifyToken(token);

    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
