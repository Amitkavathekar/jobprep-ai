import { Request, Response } from 'express';
import { ReportsService } from './reports.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';

export class ReportsController {
  public static getDashboardStats = async (req: Request, res: Response) => {
    const stats = await ReportsService.getUserDashboardStats(req.user!.id);
    return sendSuccess(res, 'User analytics stats retrieved successfully', stats, HTTP_STATUS.OK);
  };
}
