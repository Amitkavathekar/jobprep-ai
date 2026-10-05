import { Router } from "express";
import { register } from "../auth/auth.controller";


const router = Router();

// POST
router.post("/register", register);


export default router;
