import { Request, Response } from 'express';
import { PaymentsService } from './payments.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';

export class PaymentsController {
  public static createOrder = async (req: Request, res: Response) => {
    const { plan } = req.body;
    const order = await PaymentsService.createOrder(req.user!.id, plan);
    return sendSuccess(res, 'Payment order created', order, HTTP_STATUS.CREATED);
  };

  public static verifyPayment = async (req: Request, res: Response) => {
    const { orderId, paymentId, plan } = req.body;
    const result = await PaymentsService.verifyPayment(req.user!.id, orderId, paymentId, plan);
    return sendSuccess(res, 'Payment verified & plan upgraded', result, HTTP_STATUS.OK);
  };
}
