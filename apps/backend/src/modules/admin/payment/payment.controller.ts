import type { Request, Response, NextFunction } from "express";
import {
  getAdminPaymentsService,
  refundPaymentService,
} from "./payment.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// GET /api/admin/payments
export const getAdminPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminPaymentsService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Admin payments fetched from MongoDB",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/payments/:id/refund
export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const { reason = "Admin processed refund" } = req.body;

    const txn = await refundPaymentService(id, reason);

    if (!txn) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Transaction ${(txn as any).transactionId} refunded in database`,
      data: txn,
    });
  } catch (error) {
    next(error);
  }
};
