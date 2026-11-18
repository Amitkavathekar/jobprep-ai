import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { HTTP_STATUS } from "../constants/http-status";



export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
