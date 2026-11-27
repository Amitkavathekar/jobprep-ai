import { model, Schema } from "mongoose";

const BadgeSchema = new Schema(
  {
    badgeId: {
      type: String,
      required: true,
      unique: true,
    },

    badgeName: {
      type: String,
      required: true,
      enum: ["Popular", "Best Value"],
      trim: true,
    },
  }
);

export const BadgeModel = model("Badge", BadgeSchema);
