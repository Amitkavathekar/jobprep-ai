import { model, Schema } from "mongoose";

const DiscountTypeSchema = new Schema(
  {
    discountTypeId: {
      type: String,
      required: true,
      unique: true,
    },

    discountType: {
      type: String,
      required: true,
      enum: ["Percentage", "Amount"],
      trim: true,
    },
  }
);

export const DiscountTypeModel = model(
  "DiscountType",
  DiscountTypeSchema
);
