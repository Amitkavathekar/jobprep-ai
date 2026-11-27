import { Schema, model } from "mongoose"

const MatchLevelSchema = new Schema({
  match_level: {
    type: String,
    enum: ["Low Match", "Moderate Match", "High Match"],
    required: true,
  },
})

export const MatchLevel = model("MatchLevel", MatchLevelSchema)
