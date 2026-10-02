import { Router } from 'express';
import adminRoutes from '../modules/admin/admin.routes';
import aiAnalysisRoutes from '../modules/ai-analysis/ai-analysis.routes';
import atsRoutes from '../modules/ats/ats.routes';
import authRoutes from '../modules/auth/auth.routes';
import mockInterviewRoutes from '../modules/mock-interview/mock.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import resumeRoutes from '../modules/resume/resume.routes';
import subscriptionRoutes from '../modules/subscriptions/subscriptions.routes';
import userRoutes from '../modules/users/user.routes';

const router = Router();

//apis endpoints
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
