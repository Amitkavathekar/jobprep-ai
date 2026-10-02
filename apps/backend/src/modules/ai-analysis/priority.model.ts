import { Schema, model } from "mongoose"

const PrioritySchema = new Schema({
  difficulty_level: {
    type: String,
    enum: ["mid-level", "senior", "staff Level"],
    required: true,
  },
})

export const Priority = model("Priority", PrioritySchema)
