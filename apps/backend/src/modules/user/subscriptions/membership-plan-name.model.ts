import { model, Schema } from "mongoose";

const MembershipPlanNameSchema = new Schema(
  {
    membershipPlanNameId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MembershipPlanNameModel = model(
  "MembershipPlanName",
  MembershipPlanNameSchema
);
