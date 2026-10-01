import { Schema, model } from "mongoose"

const degreeNameSchema = new Schema(
  {
    degreename: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export const DegreeName = model("DegreeName", degreeNameSchema)
