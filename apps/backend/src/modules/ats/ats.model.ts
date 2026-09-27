import { Schema, model, Document } from 'mongoose';

export interface IATSReport extends Document {
  userId: Schema.Types.ObjectId;
  jobTitle?: string;
  jobDescription?: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  resumeText: string;
  createdAt: Date;
  updatedAt: Date;
}

const atsReportSchema = new Schema<IATSReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      default: '',
    },
    jobDescription: {
      type: String,
      default: '',
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    resumeText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ATSReportModel = model<IATSReport>('ATSReport', atsReportSchema);
