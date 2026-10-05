import { Request, Response, NextFunction } from "express";
import { registerUser } from "../auth/auth.service";
import { RegisterUserInput } from "./auth.types";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as RegisterUserInput;

    const user = await registerUser(data);

    return res.status(201).json({
      message: "user registered successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

