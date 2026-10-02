import { Schema, model } from "mongoose"

const JdSuggestionSchema = new Schema(
  {
    Ai_analytic_id: {
      type: Schema.Types.ObjectId,
      ref: "AiAnalysis",
      required: true,
    },
    priority: {
      type: Schema.Types.ObjectId,
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
)

export const JdSuggestion = model("JdSuggestion", JdSuggestionSchema)
