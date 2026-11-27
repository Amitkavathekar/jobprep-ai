import { Router } from "express";
import {
  getRolesPermissions,
  updateRolePermissions,
  createRole,
} from "./role-permission.controller";

const router = Router();

router.get("/", getRolesPermissions);
router.put("/:id", updateRolePermissions);
router.post("/", createRole);

export default router;
