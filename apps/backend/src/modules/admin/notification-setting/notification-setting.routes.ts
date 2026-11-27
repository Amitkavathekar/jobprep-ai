import { Router } from "express";
import {
  getNotificationSettings,
  updateNotificationSetting,
  createNotificationSetting,
  deleteNotificationSetting,
} from "./notification-setting.controller";

const router = Router();

router.get("/", getNotificationSettings);
router.put("/:id", updateNotificationSetting);
router.post("/", createNotificationSetting);
router.delete("/:id", deleteNotificationSetting);

export default router;
