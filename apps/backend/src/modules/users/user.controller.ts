import { Request, Response, NextFunction } from "express";
import { getAllUsers } from "../users/user.service";
import { getUserActivities, logUserActivity } from "./user-activity.service";
import { HTTP_STATUS } from "../../constants/http-status";


// GET /api/users/getUsers
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();

    return res.status(HTTP_STATUS.OK).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/activities - strictly authenticated to the calling user
export const getUserActivitiesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required to retrieve user activities",
      });
    }

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const activities = await getUserActivities(userId, limit);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User activities fetched successfully",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/activity - log an activity for the calling user
export const createUserActivityHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required to create activity",
      });
    }

    const { type, title, description, metadata } = req.body;
    if (!type || !title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Activity 'type' and 'title' are required",
      });
    }

    const activity = await logUserActivity(userId, type, title, description, metadata);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Activity logged successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
