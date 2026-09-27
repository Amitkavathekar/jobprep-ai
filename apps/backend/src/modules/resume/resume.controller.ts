import { Request, Response } from 'express';
import { ResumeService } from './resume.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class ResumeController {
  public static createResume = async (req: Request, res: Response) => {
    const resume = await ResumeService.createResume(req.user!.id, req.body);
    return sendSuccess(res, RESPONSE_MESSAGES.RESUME_CREATED, resume, HTTP_STATUS.CREATED);
  };

  public static getResumes = async (req: Request, res: Response) => {
    const resumes = await ResumeService.getUserResumes(req.user!.id);
    return sendSuccess(res, 'Resumes retrieved', resumes, HTTP_STATUS.OK);
  };

  public static getResumeById = async (req: Request, res: Response) => {
    const resumeId = req.params.id as string;
    const resume = await ResumeService.getResumeById(req.user!.id, resumeId);
    return sendSuccess(res, 'Resume retrieved', resume, HTTP_STATUS.OK);
  };

  public static updateResume = async (req: Request, res: Response) => {
    const resumeId = req.params.id as string;
    const resume = await ResumeService.updateResume(req.user!.id, resumeId, req.body);
    return sendSuccess(res, RESPONSE_MESSAGES.RESUME_UPDATED, resume, HTTP_STATUS.OK);
  };

  public static deleteResume = async (req: Request, res: Response) => {
    const resumeId = req.params.id as string;
    await ResumeService.deleteResume(req.user!.id, resumeId);
    return sendSuccess(res, RESPONSE_MESSAGES.RESUME_DELETED, null, HTTP_STATUS.OK);
  };
}
