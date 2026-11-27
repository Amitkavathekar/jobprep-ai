import type { Request, Response, NextFunction } from "express";
import {
  getRolesPermissionsService,
  updateRolePermissionsService,
  createRoleService,
  AVAILABLE_PERMISSIONS,
} from "./role-permission.service";
import { HTTP_STATUS } from "../../../constants/http-status";

export { AVAILABLE_PERMISSIONS };

// GET /api/admin/roles-permissions
export const getRolesPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getRolesPermissionsService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Roles and permissions fetched from MongoDB",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/roles-permissions/:id
export const updateRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const role = await updateRolePermissionsService(id, req.body);

    if (!role) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Role not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Permissions updated for ${role.name} in database`,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/roles-permissions
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description = "", permissions = [] } = req.body;

    if (!name) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Role name is required",
      });
      return;
    }

    const newRole = await createRoleService({ name, description, permissions });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "New role created in MongoDB database",
      data: newRole,
    });
  } catch (error) {
    next(error);
  }
};
