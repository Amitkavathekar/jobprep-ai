import { model, Schema } from "mongoose";

const DifficultyLevelSchema = new Schema(
  {
    difficultyLevelId: {
      type: String,
      required: true,
      unique: true,
    },

    difficultyLevel: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DifficultyLevelModel = model(
  "DifficultyLevel",
  DifficultyLevelSchema
);
