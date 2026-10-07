import { Router } from "express";
import { login } from "./login.controller";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

export default router;
