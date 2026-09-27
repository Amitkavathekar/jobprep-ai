import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get('/analytics', asyncHandler(AdminController.getAnalytics));

export default router;
