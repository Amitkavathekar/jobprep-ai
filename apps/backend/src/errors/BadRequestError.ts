import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/http-status";

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad Request") {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}