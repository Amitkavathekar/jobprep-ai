import { Router } from "express";
import registerRoutes from "./register.routes";
import loginRoutes from "./login.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// POST /api/auth/register
router.use(registerRoutes);

// POST /api/auth/login
router.use(loginRoutes);
//

//post/api/auth/admin
router.use(adminRoutes);

export default router;
