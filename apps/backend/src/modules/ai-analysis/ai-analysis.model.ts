import { Schema,Types,model } from "mongoose"

const AiAnalysisSchema = new Schema(
  {
    job_resume_id: {
      type: Types.ObjectId,
      ref: "JobResume",
      required: true,
    },
    match_level_id: {
      type: Types.ObjectId,
      ref: "MatchLevel",
      required: true,
    },
    match_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    working_point: {
      type: Number,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
)

export const AiAnalysis = model("AiAnalysis", AiAnalysisSchema);
