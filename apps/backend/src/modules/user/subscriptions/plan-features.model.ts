import { model, Schema, Types } from "mongoose";

const PlanFeatureSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    membershipPlanId: {
      type: Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },

    featureName: {
      type: String,
      required: true,
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

export const PlanFeatureModel = model(
  "PlanFeature",
  PlanFeatureSchema
);
