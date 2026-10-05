import { Router } from "express";
import { getUsers } from "../users/user.controller";


const router = Router();


// GET /api/users
router.get("/getUsers", getUsers);

export default router;
