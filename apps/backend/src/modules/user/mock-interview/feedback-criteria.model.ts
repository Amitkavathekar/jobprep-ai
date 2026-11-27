import { model, Schema } from "mongoose";

const FeedbackCriteriaSchema = new Schema(
  {
    criterionId: {
      type: String,
      required: true,
      unique: true,
    },

    criteria: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FeedbackCriteriaModel = model(
  "FeedbackCriteria",
  FeedbackCriteriaSchema
);
