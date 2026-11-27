import { Schema, model } from "mongoose";

const PrioritySchema = new Schema({
  difficulty_level: {
    type: String,
    required: true,
  },
});

export const Priority = model("Priority", PrioritySchema);
