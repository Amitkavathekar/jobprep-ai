import { model, Schema } from "mongoose";

const ModelNameSchema = new Schema(
  {
    modelNameId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      enum: ["GPT-4o", "Gemini 1.5 Pro"],
      trim: true,
    },
  }
);

export const ModelNameModel = model(
  "ModelName",
  ModelNameSchema
);
