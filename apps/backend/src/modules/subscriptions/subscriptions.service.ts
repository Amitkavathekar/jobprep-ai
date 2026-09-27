import { UserModel } from '../users/user.model.js';
import { NotFoundError } from '../../errors/NotFoundError.js';

export class SubscriptionsService {
  public static async getUserSubscription(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const limits: Record<string, { atsScansPerMonth: number; mockInterviewsPerMonth: number; resumeTemplates: string[] }> = {
      FREE: { atsScansPerMonth: 3, mockInterviewsPerMonth: 2, resumeTemplates: ['basic'] },
      PRO: { atsScansPerMonth: 50, mockInterviewsPerMonth: 30, resumeTemplates: ['basic', 'modern', 'executive'] },
      ENTERPRISE: { atsScansPerMonth: -1, mockInterviewsPerMonth: -1, resumeTemplates: ['all'] },
    };

    return {
      currentPlan: user.subscriptionPlan,
      limits: limits[user.subscriptionPlan] || limits.FREE,
    };
  }
}
