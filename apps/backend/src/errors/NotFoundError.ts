import { ApiError } from "./ApiError";

export class NotFoundError extends ApiError {
  constructor(message: string = "Not Found") {
    super(404, message);
  }
}
