import { model, Schema } from "mongoose";

const StatusSchema = new Schema(
  {
    statusId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StatusModel = model("Status", StatusSchema);
