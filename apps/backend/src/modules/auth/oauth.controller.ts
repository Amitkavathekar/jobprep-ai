import { Request, Response, NextFunction } from "express";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  getLinkedinAuthUrl,
  handleLinkedinCallback,
} from "./oauth.service";

const getFrontendUrl = (): string => {
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:3000";
};

// --- GOOGLE ---
export const googleAuthRedirect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const frontendUrl = getFrontendUrl();
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Authorization code missing")}`);
    }

    const result = await handleGoogleCallback(code);
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(result.token)}&role=${encodeURIComponent(result.user.role)}`
    );
  } catch (error: any) {
    const message = error?.message || "Google authentication failed";
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
  }
};

// --- LINKEDIN ---
export const linkedinAuthRedirect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = getLinkedinAuthUrl();
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};

export const linkedinAuthCallback = async (req: Request, res: Response) => {
  const frontendUrl = getFrontendUrl();
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Authorization code missing")}`);
    }

    const result = await handleLinkedinCallback(code);
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(result.token)}&role=${encodeURIComponent(result.user.role)}`
    );
  } catch (error: any) {
    const message = error?.message || "LinkedIn authentication failed";
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
  }
};
