import { ResumeModel, IResume } from './resume.model.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class ResumeService {
  public static async createResume(userId: string, data: Partial<IResume>) {
    return ResumeModel.create({ ...data, userId });
  }

  public static async getUserResumes(userId: string) {
    return ResumeModel.find({ userId }).sort({ updatedAt: -1 });
  }

  public static async getResumeById(userId: string, resumeId: string) {
    const resume = await ResumeModel.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new NotFoundError(RESPONSE_MESSAGES.RESUME_NOT_FOUND);
    }
    return resume;
  }

  public static async updateResume(userId: string, resumeId: string, data: Partial<IResume>) {
    const resume = await ResumeModel.findOneAndUpdate(
      { _id: resumeId, userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!resume) {
      throw new NotFoundError(RESPONSE_MESSAGES.RESUME_NOT_FOUND);
    }
    return resume;
  }

  public static async deleteResume(userId: string, resumeId: string) {
    const resume = await ResumeModel.findOneAndDelete({ _id: resumeId, userId });
    if (!resume) {
      throw new NotFoundError(RESPONSE_MESSAGES.RESUME_NOT_FOUND);
    }
    return true;
  }
}
