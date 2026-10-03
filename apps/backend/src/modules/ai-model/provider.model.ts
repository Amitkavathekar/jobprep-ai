import { model, Schema } from "mongoose";

const ProviderNameSchema = new Schema(
  {
    providerNameId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      enum: ["OpenAI", "Google"],
      trim: true,
    },
  }
);

export const ProviderNameModel = model(
  "ProviderName",
  ProviderNameSchema
);
