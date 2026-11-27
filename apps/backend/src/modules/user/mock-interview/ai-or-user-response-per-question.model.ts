import { model, Schema, Types } from "mongoose";

const AiOrUserResponsePerQuestionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    sessionId: {
      type: Types.ObjectId,
      ref: "MockInterviewSession",
      required: true,
    },

    interviewFeedbackScoreId: {
      type: Types.ObjectId,
      ref: "InterviewFeedbackScore",
      required: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    userResponse: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const AiOrUserResponsePerQuestionModel = model(
  "AiOrUserResponsePerQuestion",
  AiOrUserResponsePerQuestionSchema
);
