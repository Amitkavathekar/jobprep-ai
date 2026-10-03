import { model, Schema, Types } from "mongoose";

const MockInterviewSessionSchema = new Schema(
  {
    mockInterviewSessionId: {
      type: String,
      required: true,
      unique: true,
    },

    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },

    jobResumeId: {
      type: Types.ObjectId,
      ref: "JobResume",
      required: true,
    },

    difficultyLevelId: {
      type: Types.ObjectId,
      ref: "DifficultyLevel",
      required: true,
    },

    questionCount: {
      type: Number,
      required: true,
    },

    mode: {
      type: String,
      required: true,
      trim: true,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const MockInterviewSessionModel = model(
  "MockInterviewSession",
  MockInterviewSessionSchema
);
