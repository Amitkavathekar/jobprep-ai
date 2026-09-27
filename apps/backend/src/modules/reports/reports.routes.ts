import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', asyncHandler(ReportsController.getDashboardStats));

export default router;
