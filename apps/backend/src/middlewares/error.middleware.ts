import { Response } from "express";
import { ApiError } from "../errors/ApiError";
import { HTTP_STATUS } from "../constants/http-status";


export const errorHandler = (
  err: any,
  res: Response,
) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: "error",
      message: "Invalid JSON format in request body. Please check quotes, commas, and formatting.",
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};

