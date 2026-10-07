import { Router } from "express";
import { adminLogin } from "./admin.controller";

const router = Router();

// post /api/admin/login
router.post("/login", adminLogin);

export default router;
