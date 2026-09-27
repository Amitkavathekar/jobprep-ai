import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class AuthController {
  public static register = async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, RESPONSE_MESSAGES.SUCCESS_REGISTER, result, HTTP_STATUS.CREATED);
  };

  public static login = async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return sendSuccess(res, RESPONSE_MESSAGES.SUCCESS_LOGIN, result, HTTP_STATUS.OK);
  };

  public static getMe = async (req: Request, res: Response) => {
    return sendSuccess(res, 'Authenticated user details', { user: req.user }, HTTP_STATUS.OK);
  };
}
