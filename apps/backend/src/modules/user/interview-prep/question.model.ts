import { Schema, Types, model } from "mongoose"

const QuestionSchema = new Schema(
  {
    question_id: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
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
      type: [String],
      default: [],
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
