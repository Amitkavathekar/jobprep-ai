import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import {
  getUsers,
  getCurrentUserHandler,
  updateCurrentUserHandler,
  getUserActivitiesHandler,
  createUserActivityHandler,
} from "./user.controller";

const router = Router();

// GET /api/users/me - live profile from MongoDB
router.get("/me", authenticate, getCurrentUserHandler);

// PUT & PATCH /api/users/profile & /api/users/me - update live profile in MongoDB
router.put("/profile", authenticate, updateCurrentUserHandler);
router.put("/me", authenticate, updateCurrentUserHandler);
router.patch("/profile", authenticate, updateCurrentUserHandler);
router.patch("/me", authenticate, updateCurrentUserHandler);

// GET /api/users/getUsers
router.get("/getUsers", getUsers);

// User Activities (Strictly isolated by user_id from auth token)
router.get("/activities", authenticate, getUserActivitiesHandler);
router.post("/activity", authenticate, createUserActivityHandler);

export default router;
