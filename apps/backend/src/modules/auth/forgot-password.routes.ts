import { Router } from "express";
import {
  sendOtpController,
  verifyOtpController,
  resetPasswordController,
} from "./forgot-password.controller";

const router = Router();

// POST /api/auth/forgot-password/send-otp (or /api/auth/forgot-password)
router.post("/forgot-password", sendOtpController);
router.post("/forgot-password/send-otp", sendOtpController);

// POST /api/auth/forgot-password/verify-otp
router.post("/forgot-password/verify-otp", verifyOtpController);

// POST /api/auth/forgot-password/reset-password
router.post("/forgot-password/reset-password", resetPasswordController);

export default router;

