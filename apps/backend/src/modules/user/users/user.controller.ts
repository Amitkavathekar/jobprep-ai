import { Request, Response, NextFunction } from "express";
import { getAllUsers } from "./user.service";
import { UserModel } from "./user.model";
import { getUserActivities, logUserActivity } from "./user-activity.service";
import { HTTP_STATUS } from "../../../constants/http-status";
import { hashPassword } from "../../../shared/utils/password.util";

// GET /api/users/me - strictly retrieves the calling user's live profile from MongoDB
export const getCurrentUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (userId === "admin") {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Admin user profile fetched",
        data: {
          _id: "admin",
          id: "admin",
          fullName: "System Admin",
          email: (req as any).user?.email || "admin@jobprep.ai",
          role: "admin",
        },
      });
    }

    const user = await UserModel.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Current user profile fetched from database",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile or /me - updates the calling user's profile in MongoDB
export const updateCurrentUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (userId === "admin") {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Admin profile updated successfully",
        data: {
          _id: "admin",
          id: "admin",
          role: "admin",
          ...req.body,
        },
      });
    }

    const {
      fullName,
      full_name,
      avatarUrl,
      avatar_url,
      professionalTitle,
      professional_title,
      phoneNo,
      phone_no,
      portfolioUrl,
      portfolio_url,
      bio,
      github,
      linkedin,
      location,
      degree,
      field_of_study,
      institution,
      start_year,
      end_year,
      educationList,
      password,
    } = req.body;

    const updateData: Record<string, any> = {};

    const resolvedFullName = fullName !== undefined ? fullName : full_name;
    if (resolvedFullName !== undefined) updateData.fullName = resolvedFullName;

    const resolvedAvatarUrl = avatarUrl !== undefined ? avatarUrl : avatar_url;
    if (resolvedAvatarUrl !== undefined) updateData.avatarUrl = resolvedAvatarUrl;

    const resolvedTitle = professionalTitle !== undefined ? professionalTitle : professional_title;
    if (resolvedTitle !== undefined) updateData.professionalTitle = resolvedTitle;

    const resolvedPhone = phoneNo !== undefined ? phoneNo : phone_no;
    if (resolvedPhone !== undefined) updateData.phoneNo = resolvedPhone;

    const resolvedPortfolio = portfolioUrl !== undefined ? portfolioUrl : portfolio_url;
    if (resolvedPortfolio !== undefined) updateData.portfolioUrl = resolvedPortfolio;

    if (bio !== undefined) updateData.bio = bio;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (location !== undefined) updateData.location = location;
    if (degree !== undefined) updateData.degree = degree;
    if (field_of_study !== undefined) updateData.field_of_study = field_of_study;
    if (institution !== undefined) updateData.institution = institution;
    if (start_year !== undefined) updateData.start_year = start_year;
    if (end_year !== undefined) updateData.end_year = end_year;
    if (educationList !== undefined) updateData.educationList = educationList;
    updateData.profile_completed = true;

    if (password && typeof password === "string" && !password.includes("••")) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Profile updated successfully in database",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};


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
