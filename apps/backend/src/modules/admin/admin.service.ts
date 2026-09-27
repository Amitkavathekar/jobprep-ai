import { UserModel } from '../users/user.model.js';
import { ATSReportModel } from '../ats/ats.model.js';
import { MockSessionModel } from '../mock-interview/mock.model.js';
import { ResumeModel } from '../resume/resume.model.js';

export class AdminService {
  public static async getSystemOverview() {
    const totalUsers = await UserModel.countDocuments();
    const totalATSReports = await ATSReportModel.countDocuments();
    const totalMockInterviews = await MockSessionModel.countDocuments();
    const totalResumesCreated = await ResumeModel.countDocuments();

    return {
      usersCount: totalUsers,
      atsScansCount: totalATSReports,
      mockInterviewsCount: totalMockInterviews,
      resumesCount: totalResumesCreated,
    };
  }
}
