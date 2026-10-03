import { model, Schema, Types } from "mongoose";

const CouponSchema = new Schema(
  {
    couponId: {
      type: String,
      required: true,
      unique: true,
    },

    discountTypeId: {
      type: Types.ObjectId,
      ref: "DiscountType",
      required: true,
    },

    couponPlanId: {
      type: Types.ObjectId,
      ref: "CouponPlan",
      required: true,
    },

    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    statusId: {
      type: Types.ObjectId,
      ref: "Status",
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    usageLimit: {
      type: Number,
      required: true,
    },

    timesUsed: {
      type: Number,
      default: 0,
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

export const CouponModel = model("Coupon", CouponSchema);
