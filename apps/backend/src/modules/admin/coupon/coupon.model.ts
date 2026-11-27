import { model, Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  id: string;
  code: string;
  discountType: "Percentage" | "Flat Amount" | "Fixed";
  discountValue: number;
  applicablePlans: string[];
  usageLimit: number;
  timesUsed: number;
  expiryDate: string;
  status: "Active" | "Expired" | "Draft";
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["Percentage", "Flat Amount", "Fixed"],
      default: "Percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    applicablePlans: {
      type: [String],
      default: ["All Plans"],
    },
    usageLimit: {
      type: Number,
      default: 500,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Draft"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

export const CouponModel = model<ICoupon>("Coupon", CouponSchema);
