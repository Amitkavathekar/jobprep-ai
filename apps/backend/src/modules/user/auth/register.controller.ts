import { Request, Response, NextFunction } from "express";
import { registerUser } from "./register.service";
import { RegisterUserInput } from "./register.types";
import { HTTP_STATUS } from "@/constants/http-status";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as RegisterUserInput;

    const user = await registerUser(data);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "user registered successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
