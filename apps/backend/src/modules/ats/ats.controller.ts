import { Request, Response } from 'express';
import { ATSService } from './ats.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class ATSController {
  public static analyze = async (req: Request, res: Response) => {
    const file = req.file;
    const { jobTitle, jobDescription } = req.body;

    const report = await ATSService.analyzeResume(
      req.user!.id,
      file?.buffer as Buffer,
      jobTitle,
      jobDescription
    );

    return sendSuccess(res, RESPONSE_MESSAGES.ATS_ANALYSIS_SUCCESS, report, HTTP_STATUS.CREATED);
  };

  public static getReports = async (req: Request, res: Response) => {
    const reports = await ATSService.getUserReports(req.user!.id);
    return sendSuccess(res, 'ATS reports retrieved', reports, HTTP_STATUS.OK);
  };

  public static getReportById = async (req: Request, res: Response) => {
    const reportId = req.params.id as string;
    const report = await ATSService.getReportById(req.user!.id, reportId);
    return sendSuccess(res, 'ATS report retrieved', report, HTTP_STATUS.OK);
  };
}
