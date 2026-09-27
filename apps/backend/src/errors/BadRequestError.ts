import { ApiError } from './ApiError.js';
import { HTTP_STATUS } from '../constants/http-status.js';

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request') {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}
