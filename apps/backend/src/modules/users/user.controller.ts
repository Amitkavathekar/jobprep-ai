import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class UserController {
  public static getProfile = async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.user!.id);
    return sendSuccess(res, 'User profile fetched successfully', user, HTTP_STATUS.OK);
  };

  public static updateProfile = async (req: Request, res: Response) => {
    const updatedUser = await UserService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, RESPONSE_MESSAGES.USER_PROFILE_UPDATED, updatedUser, HTTP_STATUS.OK);
  };

  public static getAllUsers = async (_req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    return sendSuccess(res, 'All users retrieved', users, HTTP_STATUS.OK);
  };
}
