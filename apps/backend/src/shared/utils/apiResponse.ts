import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../../constants/http-status.js';

export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const sendSuccess = <T>(
  res: Response,
  message: string = 'Success',
  data?: T,
  statusCode: HttpStatusCode = HTTP_STATUS.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  error: any = null,
  statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
