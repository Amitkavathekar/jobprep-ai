import { Router } from 'express';
import { AIAnalysisController } from './ai-analysis.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.post('/career-advice', asyncHandler(AIAnalysisController.getCareerAdvice));

export default router;
