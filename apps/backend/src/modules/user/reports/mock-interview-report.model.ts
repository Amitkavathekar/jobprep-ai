import { Schema, Types, model } from "mongoose";

export interface IQuestionFeedback {
  q: string;
  score: string;
  note: string;
}

export interface IMockInterviewsReport {
  user_id: Types.ObjectId;
  job_resume_id?: Types.ObjectId;
  ats_analysis_id?: Types.ObjectId;
  interview_type: string;
  role: string;
  interview_date: Date;
  duration_minutes: number;
  attempted_questions: number;
  score: number;
  grade: string;
  tech_accuracy: number;
  communication: number;
  problem_solving: number;
  question_feedback: IQuestionFeedback[];
  created_at?: Date;
  updated_at?: Date;
}

const QuestionFeedbackSchema = new Schema<IQuestionFeedback>(
  {
    q: { type: String, required: true },
    score: { type: String, required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const MockInterviewsReportSchema = new Schema<IMockInterviewsReport>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job_resume_id: {
      type: Schema.Types.ObjectId,
      ref: "JobResume",
    },
    ats_analysis_id: {
      type: Schema.Types.ObjectId,
      ref: "AtsAnalysesCombinedReport",
    },
    interview_type: {
      type: String,
      required: true,
      default: "Mock Interview",
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    interview_date: {
      type: Date,
      default: Date.now,
    },
    duration_minutes: {
      type: Number,
      required: true,
      default: 30,
    },
    attempted_questions: {
      type: Number,
      required: true,
      default: 3,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      default: "B+",
    },
    tech_accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    communication: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    problem_solving: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    question_feedback: {
      type: [QuestionFeedbackSchema],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Compound index for high performance chronological querying per candidate
MockInterviewsReportSchema.index({ user_id: 1, created_at: -1 });

export const MockInterviewsReport = model<IMockInterviewsReport>(
  "MockInterviewsReport",
  MockInterviewsReportSchema
);
