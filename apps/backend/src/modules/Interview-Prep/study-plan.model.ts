import { Schema, Types, model } from "mongoose"

const StudyPlanSchema = new Schema(
  {
    study_plans_id: {
      type: Types.ObjectId,
      unique: true,
    },
    status_id: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },
    question_bank_id: {
      type: Types.ObjectId,
      ref: "QuestionCategory",
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    total_questions: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
)

export const StudyPlan = model("StudyPlan", StudyPlanSchema)
