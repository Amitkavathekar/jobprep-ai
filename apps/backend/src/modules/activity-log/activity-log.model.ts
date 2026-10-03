import { model, Schema, Types } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    activityLogId: {
      type: String,
      required: true,
      unique: true,
    },

    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    targetObject: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLogModel = model(
  "ActivityLog",
  ActivityLogSchema
);
