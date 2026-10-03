import { Schema, Types, model } from "mongoose"

const QuestionSchema = new Schema(
  {
    question_id: {
      type: Types.ObjectId,
      unique: true,
    },
    category_id: {
      type: Types.ObjectId,
      ref: "QuestionCategory",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    tags: {
      type: Schema.Types.Mixed,
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

export const Question = model("Question", QuestionSchema)
