import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import atsRoutes from '../modules/ats/ats.routes.js';
import mockInterviewRoutes from '../modules/mock-interview/mock.routes.js';
import resumeRoutes from '../modules/resume/resume.routes.js';
import aiAnalysisRoutes from '../modules/ai-analysis/ai-analysis.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import subscriptionRoutes from '../modules/subscriptions/subscriptions.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const router = Router();

// Mount Feature Module Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ats', atsRoutes);
router.use('/mock-interview', mockInterviewRoutes);
router.use('/resume', resumeRoutes);
router.use('/ai-analysis', aiAnalysisRoutes);
router.use('/reports', reportsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes);

export default router;
