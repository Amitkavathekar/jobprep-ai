import { ATSReportModel } from '../ats/ats.model.js';
import { MockSessionModel } from '../mock-interview/mock.model.js';

export class ReportsService {
  public static async getUserDashboardStats(userId: string) {
    const totalATS = await ATSReportModel.countDocuments({ userId });
    const totalInterviews = await MockSessionModel.countDocuments({ userId });

    const recentATS = await ATSReportModel.find({ userId }).sort({ createdAt: -1 }).limit(1);
    const recentInterview = await MockSessionModel.find({ userId }).sort({ createdAt: -1 }).limit(1);

    const latestATSScore = recentATS[0]?.atsScore || 0;
    const latestInterviewScore = recentInterview[0]?.overallScore || 0;

    return {
      totalATSScans: totalATS,
      totalMockInterviews: totalInterviews,
      latestATSScore,
      latestInterviewScore,
      averageReadinessScore: Math.round((latestATSScore + latestInterviewScore) / (latestATSScore && latestInterviewScore ? 2 : 1)),
    };
  }
}
