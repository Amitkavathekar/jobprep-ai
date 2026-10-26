import { Schema, Types, model } from "mongoose"

const StudyPlanSchema = new Schema(
  {
    study_plans_id: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
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
    status_id: {
      type: Types.ObjectId,
      ref: "Status",
      required: false,
    },
    status: {
      type: String,
      enum: ["done", "in-progress", "upcoming"],
      default: "upcoming",
    },
    question_bank_id: {
      type: Types.ObjectId,
      ref: "QuestionCategory",
      required: false,
    },
    day: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    focus: {
      type: String,
      required: false,
    },
    total_questions: {
      type: Number,
      required: true,
    },
    items: {
      type: Number,
      required: false,
    },
    category_title: {
      type: String,
      required: false,
    },
    category_icon: {
      type: String,
      required: false,
    },
    category_color: {
      type: String,
      required: false,
    },
    key_questions: {
      type: [String],
      default: [],
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
