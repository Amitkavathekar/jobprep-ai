import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/http-status";

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}
