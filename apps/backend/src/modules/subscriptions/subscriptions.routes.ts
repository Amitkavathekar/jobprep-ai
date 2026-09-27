import { Router } from 'express';
import { SubscriptionsController } from './subscriptions.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.get('/my-plan', asyncHandler(SubscriptionsController.getPlanDetails));

export default router;
