import { ApiError } from './ApiError.js';
import { HTTP_STATUS } from '../constants/http-status.js';

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access Forbidden') {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}
