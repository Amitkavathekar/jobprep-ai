import { ApiError } from './ApiError.js';
import { HTTP_STATUS } from '../constants/http-status.js';

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource Not Found') {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}
