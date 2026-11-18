import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/http-status";

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}
