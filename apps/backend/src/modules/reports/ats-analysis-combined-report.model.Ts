import { Schema, model } from "mongoose";

const AtsAnalysesCombinedReportSchema = new Schema(
  {
    ats_analysis_id: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    job_resume_id: {
      type: Schema.Types.ObjectId,
      ref: "JobResume",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    overall_match_score: {
      type: Number,
      required: true,
    },
    ats_parse_score: {
      type: Number,
      required: true,
    },
    matched_skills: {
      type: Schema.Types.Mixed,
      required: true,
    },
    missing_keywords: {
      type: Schema.Types.Mixed,
      required: true,
    },
    recommendations: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
);

export const AtsAnalysesCombinedReport = model(
  "AtsAnalysesCombinedReport",
  AtsAnalysesCombinedReportSchema,
);

