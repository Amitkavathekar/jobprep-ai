import { Request, Response, NextFunction } from "express";
import { loginUser } from "./login.service";
import { LoginUserInput } from "./login.types";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as LoginUserInput;

    const user = await loginUser(data);

    return res.status(200).json({
      message: "login successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
