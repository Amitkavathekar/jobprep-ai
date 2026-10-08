import { Router } from "express";
import {
  googleAuthRedirect,
  googleAuthCallback,
  linkedinAuthRedirect,
  linkedinAuthCallback,
} from "./oauth.controller";

const router = Router();

// Google OAuth
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

// LinkedIn OAuth
router.get("/linkedin", linkedinAuthRedirect);
router.get("/linkedin/callback", linkedinAuthCallback);

export default router;
