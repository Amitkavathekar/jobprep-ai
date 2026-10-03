import { model, Schema, Types } from "mongoose";

const MembershipPlanSchema = new Schema(
  {
    membershipPlanId: {
      type: String,
      required: true,
      unique: true,
    },

    membershipPlanNameId: {
      type: Types.ObjectId,
      ref: "MembershipPlanName",
      required: true,
    },

    badgeId: {
      type: Types.ObjectId,
      ref: "Badge",
    },

    durationMonths: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },

    mockLimit: {
      type: Number,
      required: true,
    },

    atsLimit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MembershipPlanModel = model(
  "MembershipPlan",
  MembershipPlanSchema
);
