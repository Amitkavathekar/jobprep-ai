import type { Request, Response, NextFunction } from "express";
import {
  getCouponsService,
  createCouponService,
  updateCouponService,
  deleteCouponService,
  validateCouponService,
} from "./coupon.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// GET /api/admin/coupons
export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await getCouponsService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Coupons fetched successfully",
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/coupons
export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, discountType, discountValue, applicablePlans, usageLimit, timesUsed, expiryDate, status } =
      req.body;

    if (!code || !code.trim()) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Coupon code is required",
      });
      return;
    }

    const result = await createCouponService({
      code,
      discountType,
      discountValue,
      applicablePlans,
      usageLimit,
      timesUsed,
      expiryDate,
      status,
    });

    if ("error" in result && result.error === "CONFLICT") {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Coupon created successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/coupons/:id
export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const coupon = await updateCouponService(id, req.body);

    if (!coupon) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Coupon not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/coupons/:id
export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const deleted = await deleteCouponService(id);

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Coupon not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/coupons/validate/:code
export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = String(req.params.code || "").trim();
    if (!code) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Coupon code is required",
      });
      return;
    }

    const result = await validateCouponService(code);

    if (result.notFound) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        valid: false,
        message: result.message,
      });
      return;
    }

    if (!result.valid) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        valid: false,
        message: result.message,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      valid: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
