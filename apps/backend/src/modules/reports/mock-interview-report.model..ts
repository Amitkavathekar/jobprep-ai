import { Schema, Types, model } from "mongoose";

const MockInterviewsReportSchema = new Schema(
  {
    mock_interview_report_id: {
      type: Types.ObjectId,
      unique: true,
    },
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    job_resume_id: {
      type: Types.ObjectId,
      ref: "JobResume",
      required: true,
    },
    ats_analysis_id: {
      type: Types.ObjectId,
      ref: "AtsAnalysesCombinedReport",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    interview_date: {
      type: Date,
      required: true,
    },
    duration_minutes: {
      type: Number,
      required: true,
    },
    attempted_questions: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    tech_accuracy: {
      type: Number,
      required: true,
    },
    communication: {
      type: Number,
      required: true,
    },
    problem_solving: {
      type: Number,
      required: true,
    },
    question_feedback: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export const MockInterviewsReport = model(
  "MockInterviewsReport",
  MockInterviewsReportSchema,
);

