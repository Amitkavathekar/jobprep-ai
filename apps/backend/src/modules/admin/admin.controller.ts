import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';

export class AdminController {
  public static getAnalytics = async (_req: Request, res: Response) => {
    const stats = await AdminService.getSystemOverview();
    return sendSuccess(res, 'Admin analytics overview retrieved', stats, HTTP_STATUS.OK);
  };
}
