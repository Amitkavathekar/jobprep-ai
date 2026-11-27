import type { Request, Response, NextFunction } from "express";
import {
  getNotificationSettingsService,
  updateNotificationSettingService,
  createNotificationSettingService,
  deleteNotificationSettingService,
} from "./notification-setting.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// GET /api/admin/notifications
export const getNotificationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await getNotificationSettingsService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Notification settings fetched successfully from database",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/notifications/:id
export const updateNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const setting = await updateNotificationSettingService(id, req.body);

    if (!setting) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Notification setting not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Notification setting updated in database",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/notifications
export const createNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, title, description, enabled = true, channel = "website" } = req.body;

    if (!title) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Title is required",
      });
      return;
    }

    const newSetting = await createNotificationSettingService({
      category,
      title,
      description,
      enabled,
      channel,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Notification rule created in database",
      data: newSetting,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/notifications/:id
export const deleteNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const deleted = await deleteNotificationSettingService(id);

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Notification setting not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Notification setting deleted from database",
    });
  } catch (error) {
    next(error);
  }
};
