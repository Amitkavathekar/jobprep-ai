import { Schema, model, Document } from 'mongoose';

export interface IAIAnalysisHistory extends Document {
  userId: Schema.Types.ObjectId;
  targetRole: string;
  currentSkills: string[];
  recommendedSkills: string[];
  learningRoadmap: string[];
  careerOutlook: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysisHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    learningRoadmap: {
      type: [String],
      default: [],
    },
    careerOutlook: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const AIAnalysisModel = model<IAIAnalysisHistory>('AIAnalysis', aiAnalysisSchema);
