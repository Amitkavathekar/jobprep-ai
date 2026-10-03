import { model, Schema } from "mongoose";

const PaymentMethodSchema = new Schema(
  {
    paymentMethodId: {
      type: String,
      required: true,
      unique: true,
    },

    methodName: {
      type: String,
      required: true,
      enum: ["Credit Card", "UPI", "NetBanking"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentMethodModel = model(
  "PaymentMethod",
  PaymentMethodSchema
);
