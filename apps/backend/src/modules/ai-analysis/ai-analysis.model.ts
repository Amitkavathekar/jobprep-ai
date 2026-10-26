import { Schema, Types, model } from "mongoose";

const AiAnalysisSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    job_resume_id: {
      type: Types.ObjectId,
      ref: "JobResume",
      required: false,
    },
    match_level_id: {
      type: Types.ObjectId,
      ref: "MatchLevel",
      required: false,
    },
    match_score: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
      max: 100,
    },
    working_points: {
      type: [String],
      default: [],
    },
    matched_keywords: {
      type: [String],
      default: [],
    },
    missing_keywords: {
      type: [String],
      default: [],
    },
    partial_keywords: {
      type: [String],
      default: [],
    },
    parsed_resume: {
      type: Schema.Types.Mixed,
      default: null,
    },
    job_description: {
      type: String,
      default: "",
    },
    resume_file_name: {
      type: String,
      default: "",
    },
    gaps: {
      type: Schema.Types.Mixed,
      default: [],
    },
    suggestions: {
      type: Schema.Types.Mixed,
      default: [],
    },
    match_level: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const AiAnalysis = model("AiAnalysis", AiAnalysisSchema);
