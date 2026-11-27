import { model, Schema, Types } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
    },

    sessionId: {
      type: Types.ObjectId,
      ref: "MockInterviewSession",
      required: true,
    },

    sender: {
      type: String,
      required: true,
      enum: ["user", "ai"],
    },

    messageText: {
      type: String,
      required: true,
      trim: true,
    },

    messageType: {
      type: String,
      required: true,
      trim: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatMessageModel = model(
  "ChatMessage",
  ChatMessageSchema
);
