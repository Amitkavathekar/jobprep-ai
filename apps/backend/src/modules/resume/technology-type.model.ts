import { Schema, Types, model } from "mongoose"

const TechnologyTypeSchema = new Schema(
  {
    technology_id: {
      type: Types.ObjectId,
      ref: "Technology",
      required: true,
    },

    type_name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
)

export const TechnologyType = model("TechnologyType", TechnologyTypeSchema)
