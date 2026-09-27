import { Request, Response } from 'express';
import { AIAnalysisService } from './ai-analysis.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';

export class AIAnalysisController {
  public static getCareerAdvice = async (req: Request, res: Response) => {
    const { targetRole, currentSkills } = req.body;
    const advice = await AIAnalysisService.getCareerAdvice(
      targetRole || 'Fullstack Developer',
      Array.isArray(currentSkills) ? currentSkills : []
    );
    return sendSuccess(res, 'Career advice generated successfully', advice, HTTP_STATUS.OK);
  };
}
