import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', asyncHandler(UserController.getProfile));
router.put('/profile', asyncHandler(UserController.updateProfile));

// Admin only route
router.get('/', roleMiddleware(ROLES.ADMIN), asyncHandler(UserController.getAllUsers));

export default router;
