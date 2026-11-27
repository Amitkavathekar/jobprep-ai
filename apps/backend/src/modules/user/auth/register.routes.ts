import { Router } from "express";
import { register } from "./register.controller";

const router = Router();

// ost /api/auth/register
router.post("/register", register);
export default router;
