import { Schema, Types, model } from "mongoose";

const JdSuggestionSchema = new Schema(
  {
    ai_analysis_id: {
      type: Types.ObjectId,
      ref: "AiAnalysis",
      required: true,
    },
    priority: {
      type: Types.ObjectId,
      ref: "Priority",
      required: true,
    },
    section: {
      type: Number,
      required: true,
    },
    suggestion_text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

export const JdSuggestion = model("JdSuggestion", JdSuggestionSchema);
