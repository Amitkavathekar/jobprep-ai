import { Router } from 'express';
import { MockInterviewController } from './mock.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.post('/start', asyncHandler(MockInterviewController.createSession));
router.post('/evaluate', asyncHandler(MockInterviewController.evaluateAnswer));
router.get('/sessions', asyncHandler(MockInterviewController.getSessions));
router.get('/sessions/:id', asyncHandler(MockInterviewController.getSessionById));

export default router;
