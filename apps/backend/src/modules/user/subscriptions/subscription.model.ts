import { model, Schema, Types } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    subscriptionId: {
      type: String,
      required: true,
      unique: true,
    },

    membershipPlanId: {
      type: Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },

    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel = model(
  "Subscription",
  SubscriptionSchema
);
