import { Schema, Types, model } from "mongoose"

const QuestionCategorySchema = new Schema(
  {
    question_category_id: {
      type: Types.ObjectId,
      unique: true,
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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
)

export const QuestionCategory = model("QuestionCategory",QuestionCategorySchema)
