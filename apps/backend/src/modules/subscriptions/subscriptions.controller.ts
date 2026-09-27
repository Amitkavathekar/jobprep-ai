import { Request, Response } from 'express';
import { SubscriptionsService } from './subscriptions.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/http-status.js';

export class SubscriptionsController {
  public static getPlanDetails = async (req: Request, res: Response) => {
    const details = await SubscriptionsService.getUserSubscription(req.user!.id);
    return sendSuccess(res, 'Subscription details retrieved', details, HTTP_STATUS.OK);
  };
}
