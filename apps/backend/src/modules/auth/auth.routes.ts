import { Router } from "express";
import registerRoutes from "./register.routes";
import loginRoutes from "./login.routes";
import adminRoutes from "./admin.routes";
import oauthRoutes from "./oauth.routes";

const router = Router();

// POST /api/auth/register
router.use(registerRoutes);

// POST /api/auth/login
router.use(loginRoutes);

// GET /api/auth/google, /api/auth/github, /api/auth/linkedin
router.use(oauthRoutes);

// POST /api/auth/admin
router.use(adminRoutes);

export default router;
