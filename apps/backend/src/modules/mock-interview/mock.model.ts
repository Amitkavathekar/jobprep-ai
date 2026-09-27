import { Schema, model, Document } from 'mongoose';

export interface IMockQuestion {
  question: string;
  category: string;
  expectedKeyPoints?: string[];
  userAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface IMockSession extends Document {
  userId: Schema.Types.ObjectId;
  roleTitle: string;
  experienceLevel: string;
  questions: IMockQuestion[];
  overallScore?: number;
  status: 'STARTED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const mockQuestionSchema = new Schema<IMockQuestion>({
  question: { type: String, required: true },
  category: { type: String, default: 'Technical' },
  expectedKeyPoints: { type: [String], default: [] },
  userAnswer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  score: { type: Number, default: 0 },
});

const mockSessionSchema = new Schema<IMockSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roleTitle: { type: String, required: true },
    experienceLevel: { type: String, default: 'Intermediate' },
    questions: [mockQuestionSchema],
    overallScore: { type: Number, default: 0 },
    status: { type: String, enum: ['STARTED', 'COMPLETED'], default: 'STARTED' },
  },
  { timestamps: true }
);

export const MockSessionModel = model<IMockSession>('MockSession', mockSessionSchema);
