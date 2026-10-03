import { model, Schema } from "mongoose";

const AiFeatureTypeSchema = new Schema(
  {
    aiFeatureTypeId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      enum: [
        "Resume Analysis",
        "ATS Scan",
        "Mock Interview",
        "Interview Prep",
      ],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  }
);

export const AiFeatureTypeModel = model(
  "AiFeatureType",
  AiFeatureTypeSchema
);
