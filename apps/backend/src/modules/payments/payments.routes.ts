import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.post('/create-order', asyncHandler(PaymentsController.createOrder));
router.post('/verify', asyncHandler(PaymentsController.verifyPayment));

export default router;
