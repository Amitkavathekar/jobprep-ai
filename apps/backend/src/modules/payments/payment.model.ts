import { model, Schema, Types } from "mongoose";

const PaymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },

    transactionId: {
      type: Types.ObjectId,
      ref: "Transaction",
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    subscriptionId: {
      type: Types.ObjectId,
      ref: "Subscription",
      required: true,
    },

    couponId: {
      type: Types.ObjectId,
      ref: "Coupon",
    },

    gatewayName: {
      type: String,
      trim: true,
    },

    paymentMethodId: {
      type: Types.ObjectId,
      ref: "PaymentMethod",
    },

    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentModel = model("Payment", PaymentSchema);
