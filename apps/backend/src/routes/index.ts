import { Router } from 'express';
import adminRoutes from '../modules/admin/admin.routes';
import userRoutes from '../modules/user/user.routes';

const router = Router();

// Admin APIs (/api/admin/*)
router.use('/admin', adminRoutes);

// User APIs (/api/auth, /api/users, /api/ats, /api/interview-prep, etc.)
router.use('/', userRoutes);

export default router;
