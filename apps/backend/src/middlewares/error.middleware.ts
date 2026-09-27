import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../errors/ApiError.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const errorMiddleware: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message, { stack: err.stack });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Fallback for unhandled internal server errors
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};
