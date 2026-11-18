import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/http-status";

export class NotFoundError extends ApiError {
  constructor(message: string = "Not Found") {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}
