import { model, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Pricing", "User Action", "Coupon", "Settings"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = model("Category", CategorySchema);
