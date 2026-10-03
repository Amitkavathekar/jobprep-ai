import { model, Schema, Types } from "mongoose";

const TransactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    gatewayTransactionId: {
      type: String,
      trim: true,
    },

    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },

    refundId: {
      type: Types.ObjectId,
      ref: "Refund",
    },

    amount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    attemptNumber: {
      type: Number,
      default: 1,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = model(
  "Transaction",
  TransactionSchema
);
