import { model, Schema, Types } from "mongoose";

const StatusSchema = new Schema(
  {
    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },
  }
);

export const StatusModel = model("Status", StatusSchema);

