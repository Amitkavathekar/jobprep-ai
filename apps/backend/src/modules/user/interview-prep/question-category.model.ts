import { Schema, Types, model } from "mongoose"

const QuestionCategorySchema = new Schema(
  {
    question_category_id: {
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
      required: true,
    },
    category_title: {
      type: String,
      required: true,
    },
    category_description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "◈",
    },
    color: {
      type: String,
      default: "#7c3aed",
    },
    count: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
)

export const QuestionCategory = model("QuestionCategory", QuestionCategorySchema)
