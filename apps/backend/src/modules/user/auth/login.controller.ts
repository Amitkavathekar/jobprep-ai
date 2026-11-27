import { Request, Response, NextFunction } from "express";
import { loginUser } from "./login.service";
import { LoginUserInput } from "./login.types";
import { HTTP_STATUS } from "@/constants/http-status";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as LoginUserInput;

    const user = await loginUser(data);

    return res.status(HTTP_STATUS.OK).json({
      message: "login successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
