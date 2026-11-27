import { model, Schema, Types } from "mongoose";

const InterviewFeedbackScoreSchema = new Schema(
  {
    interviewFeedbackScoreId: {
      type: String,
      required: true,
      unique: true,
    },

    sessionId: {
      type: Types.ObjectId,
      ref: "MockInterviewSession",
      required: true,
    },

    criterionId: {
      type: Types.ObjectId,
      ref: "FeedbackCriteria",
      required: true,
    },

    aiMatchRating: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewFeedbackScoreModel = model(
  "InterviewFeedbackScore",
  InterviewFeedbackScoreSchema
);
