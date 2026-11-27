import { Router } from "express";
import {
  getAtsConfig,
  getInterviewTypes,
} from "./ats-interview-config.controller";

const router = Router();

router.get("/ats-config", getAtsConfig);
router.get("/interview-types", getInterviewTypes);

export default router;
