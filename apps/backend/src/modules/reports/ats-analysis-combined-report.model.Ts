import { Schema, Types, model } from "mongoose";

export interface IAtsAnalysesCombinedReport {
  user_id: Types.ObjectId;
  target_job_role: string;
  company?: string;
  overall_match_score: number;
  ats_parse_score: number;
  matched_skills: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  raw_summary?: string;
  created_at?: Date;
  updated_at?: Date;
}

const AtsAnalysesCombinedReportSchema = new Schema<IAtsAnalysesCombinedReport>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    target_job_role: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "Target Role Application",
    },
    overall_match_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ats_parse_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matched_skills: {
      type: [String],
      default: [],
    },
    missing_keywords: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    raw_summary: {
      type: String,
      trim: true,
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
AtsAnalysesCombinedReportSchema.index({ user_id: 1, created_at: -1 });

export const AtsAnalysesCombinedReport = model<IAtsAnalysesCombinedReport>(
  "AtsAnalysesCombinedReport",
  AtsAnalysesCombinedReportSchema
);
