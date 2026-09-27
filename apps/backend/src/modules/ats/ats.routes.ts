import { Router } from 'express';
import { ATSController } from './ats.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/analyze',
  uploadMiddleware.single('resume'),
  asyncHandler(ATSController.analyze)
);
router.get('/reports', asyncHandler(ATSController.getReports));
router.get('/reports/:id', asyncHandler(ATSController.getReportById));

export default router;
