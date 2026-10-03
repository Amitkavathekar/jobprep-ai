import { model, Schema } from "mongoose";

const AccountStatusSchema = new Schema(
  {
    accountStatusId: {
      type: String,
      required: true,
      unique: true,
    },

    statusName: {
      type: String,
      required: true,
      enum: ["ACTIVE", "SUSPENDED", "INACTIVE"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AccountStatusModel = model(
  "AccountStatus",
  AccountStatusSchema
);
