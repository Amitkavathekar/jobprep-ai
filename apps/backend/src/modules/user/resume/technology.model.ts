import { Schema, model } from "mongoose";

const TechnologySchema = new Schema(
  {
    technology_name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
);

export const Technology = model("Technology", TechnologySchema);


