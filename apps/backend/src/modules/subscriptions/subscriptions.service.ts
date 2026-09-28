import { UserModel } from '../users/user.model.js';
import { SubscriptionModel } from './subscription.model.js';
import { NotFoundError } from '../../errors/NotFoundError.js';

export class SubscriptionsService {
  public static async getUserSubscription(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let sub = await SubscriptionModel.findOne({ userId });
    if (!sub) {
      sub = await SubscriptionModel.create({
        userId,
        plan: user.subscriptionPlan || 'FREE',
        status: 'ACTIVE',
      });
    }

    const limits: Record<string, { atsScansPerMonth: number; mockInterviewsPerMonth: number; resumeTemplates: string[] }> = {
      FREE: { atsScansPerMonth: 3, mockInterviewsPerMonth: 2, resumeTemplates: ['basic'] },
      PRO: { atsScansPerMonth: 50, mockInterviewsPerMonth: 30, resumeTemplates: ['basic', 'modern', 'executive'] },
      ENTERPRISE: { atsScansPerMonth: -1, mockInterviewsPerMonth: -1, resumeTemplates: ['all'] },
    };

    return {
      currentPlan: user.subscriptionPlan,
      subscriptionDetails: sub,
      limits: limits[user.subscriptionPlan] || limits.FREE,
    };
  }
}

