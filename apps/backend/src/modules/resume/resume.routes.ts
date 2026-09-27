import { Router } from 'express';
import { ResumeController } from './resume.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.post('/', asyncHandler(ResumeController.createResume));
router.get('/', asyncHandler(ResumeController.getResumes));
router.get('/:id', asyncHandler(ResumeController.getResumeById));
router.put('/:id', asyncHandler(ResumeController.updateResume));
router.delete('/:id', asyncHandler(ResumeController.deleteResume));

export default router;
