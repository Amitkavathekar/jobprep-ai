import { Request, Response, NextFunction } from "express";
import { loginAdmin } from "./admin.service";
import { HTTP_STATUS } from "../../constants/http-status";


export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin({ email, password });

    return res.status(HTTP_STATUS.OK).json({
      message: "Admin login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
