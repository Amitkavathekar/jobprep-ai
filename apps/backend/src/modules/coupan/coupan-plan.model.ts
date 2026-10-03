import { model, Schema } from "mongoose";

const CouponPlanSchema = new Schema(
  {
    couponPlanId: {
      type: String,
      required: true,
      unique: true,
    },

    couponPlan: {
      type: String,
      required: true,
      enum: ["Basic", "Plus", "Pro", "Elite"],
      trim: true,
    },
  }
);

export const CouponPlanModel = model(
  "CouponPlan",
  CouponPlanSchema
);
