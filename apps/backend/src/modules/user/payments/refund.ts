import { model, Schema, Types } from "mongoose";

const RefundSchema = new Schema(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },

    refundAmount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    refundTransactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RefundModel = model("Refund", RefundSchema);
