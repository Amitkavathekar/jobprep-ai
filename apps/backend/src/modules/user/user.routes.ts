import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./users/user.routes";
import atsRoutes from "./ats/ats.routes";
import interviewPrepRoutes from "./interview-prep/interview-prep.routes";
import mockInterviewRoutes from "./mock-interview/mock.routes";
import resumeRoutes from "./resume/resume.routes";
import aiAnalysisRoutes from "./ai-analysis/ai-analysis.routes";
import reportsRoutes from "./reports/reports.routes";
import paymentsRoutes from "./payments/payments.routes";
import subscriptionRoutes from "./subscriptions/subscriptions.routes";
import {
  getSupportTickets,
  createSupportTicket,
  getUserSupportTickets,
} from "../admin/support-ticket/support-ticket.controller";

const router = Router();

// User feature endpoints
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/ats", atsRoutes);
router.use("/interview-prep", interviewPrepRoutes);
router.use("/mock-interview", mockInterviewRoutes);
router.use("/resume", resumeRoutes);
router.use("/ai-analysis", aiAnalysisRoutes);
router.use("/reports", reportsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/subscriptions", subscriptionRoutes);

// Candidate / User support tickets endpoints
router.get("/support-tickets", getSupportTickets);
router.get("/support-tickets/my", getUserSupportTickets);
router.post("/support-tickets", createSupportTicket);

export default router;
