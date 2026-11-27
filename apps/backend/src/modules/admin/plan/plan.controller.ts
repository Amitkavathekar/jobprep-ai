import type { Request, Response, NextFunction } from "express";
import {
  getAdminPlansService,
  createAdminPlanService,
  updateAdminPlanService,
  toggleAdminPlanStatusService,
  deleteAdminPlanService,
  formatPlanDoc,
  seedPlansIfEmpty,
  DEFAULT_DATABASE_PLANS,
} from "./plan.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// Re-export helpers for backward compatibility
export { formatPlanDoc, seedPlansIfEmpty, DEFAULT_DATABASE_PLANS };

// GET /api/admin/plans
export const getAdminPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const formattedPlans = await getAdminPlansService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Membership plans fetched successfully from database",
      data: formattedPlans,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/plans
export const createAdminPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, priceINR } = req.body;

    if (!name || !name.trim()) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Plan name is required",
      });
      return;
    }

    if (priceINR === undefined || priceINR === null || isNaN(Number(priceINR))) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Valid price in INR is required",
      });
      return;
    }

    const plan = await createAdminPlanService(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Membership plan created successfully in database",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/plans/:id
export const updateAdminPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "").trim();
    const plan = await updateAdminPlanService(id, req.body);

    if (!plan) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Membership plan "${id}" not found in database`,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Membership plan updated successfully in database",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/plans/:id/status
export const toggleAdminPlanStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "").trim();
    const result = await toggleAdminPlanStatusService(id, req.body.status);

    if (!result) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Membership plan "${id}" not found in database`,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Plan status updated to ${result.nextStatus}`,
      data: result.plan,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/plans/:id
export const deleteAdminPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "").trim();
    const planName = await deleteAdminPlanService(id);

    if (!planName) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Membership plan "${id}" not found in database`,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Membership plan "${planName}" deleted successfully from database`,
    });
  } catch (error) {
    next(error);
  }
};
