import { Schema, model } from "mongoose";

const JdGapSchema = new Schema(
  {
    Ai_analytic_id: {
      type: Schema.Types.ObjectId,
      ref: "AiAnalysis",
      required: true,
    },
    severity_id: {
      type: Schema.Types.ObjectId,
      ref: "Severity",
      required: true,
    },
    jd_gap_titles: {
      type: String,
      required: true,
    },
    jd_gap_description: {
      type: String,
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

export const JdGap = model("JdGap", JdGapSchema);

