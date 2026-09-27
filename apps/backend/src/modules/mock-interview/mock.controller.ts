import { Request, Response } from 'express';
import { MockInterviewService } from './mock.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class MockInterviewController {
  public static createSession = async (req: Request, res: Response) => {
    const { roleTitle, experienceLevel } = req.body;
    const session = await MockInterviewService.generateSession(
      req.user!.id,
      roleTitle,
      experienceLevel
    );
    return sendSuccess(res, RESPONSE_MESSAGES.MOCK_QUESTIONS_GENERATED, session, HTTP_STATUS.CREATED);
  };

  public static evaluateAnswer = async (req: Request, res: Response) => {
    const { sessionId, questionIndex, userAnswer } = req.body;
    const result = await MockInterviewService.evaluateAnswer(
      req.user!.id,
      sessionId,
      Number(questionIndex),
      userAnswer
    );
    return sendSuccess(res, RESPONSE_MESSAGES.MOCK_EVALUATION_SUCCESS, result, HTTP_STATUS.OK);
  };

  public static getSessions = async (req: Request, res: Response) => {
    const sessions = await MockInterviewService.getUserSessions(req.user!.id);
    return sendSuccess(res, 'Mock interview sessions retrieved', sessions, HTTP_STATUS.OK);
  };

  public static getSessionById = async (req: Request, res: Response) => {
    const sessionId = req.params.id as string;
    const session = await MockInterviewService.getSessionById(req.user!.id, sessionId);
    return sendSuccess(res, 'Mock interview session details retrieved', session, HTTP_STATUS.OK);
  };
}
