import { model, Schema, Types } from "mongoose";

const UserDirectorySchema = new Schema(
  {
    userDirectoryId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountStatusId: {
      type: Types.ObjectId,
      ref: "AccountStatus",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserDirectoryModel = model(
  "UserDirectory",
  UserDirectorySchema
);
