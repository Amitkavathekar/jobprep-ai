import { ApiError } from './ApiError.js';
import { HTTP_STATUS } from '../constants/http-status.js';

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}
