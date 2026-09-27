import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validate(loginSchema), asyncHandler(AuthController.login));
router.get('/me', authMiddleware, asyncHandler(AuthController.getMe));

export default router;
