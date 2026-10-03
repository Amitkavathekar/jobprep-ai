import { model, Schema, Types } from "mongoose";

const AiModelSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    modelNameId: {
      type: Types.ObjectId,
      ref: "ModelName",
      required: true,
    },

    providerNameId: {
      type: Types.ObjectId,
      ref: "ProviderName",
      required: true,
    },

    aiFeatureTypeId: {
      type: Types.ObjectId,
      ref: "AiFeatureType",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AiModelModel = model("AiModel", AiModelSchema);
