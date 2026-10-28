import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getUsers,
  getUserActivitiesHandler,
  createUserActivityHandler,
} from "./user.controller";

const router = Router();

// GET /api/users/getUsers
router.get("/getUsers", getUsers);

// User Activities (Strictly isolated by user_id from auth token)
router.get("/activities", authenticate, getUserActivitiesHandler);
router.post("/activity", authenticate, createUserActivityHandler);

export default router;
