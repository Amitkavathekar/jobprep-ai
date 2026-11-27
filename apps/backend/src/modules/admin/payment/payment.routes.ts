import { Router } from "express";
import {
  getAdminPayments,
  refundPayment,
} from "./payment.controller";

const router = Router();

router.get("/", getAdminPayments);
router.post("/:id/refund", refundPayment);

export default router;
