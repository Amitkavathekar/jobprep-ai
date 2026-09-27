import { HTTP_STATUS, HttpStatusCode } from '../constants/http-status.js';

export class ApiError extends Error {
  public statusCode: HttpStatusCode;
  public isOperational: boolean;

  constructor(
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: string = 'Internal Server Error',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
