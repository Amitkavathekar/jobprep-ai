import { Schema, model } from "mongoose"

const SeveritySchema = new Schema({
  severity: {
    type: String,
    enum: ["red", "orange", "blue"],
    required: true,
  },
})

export const Severity = model("Severity", SeveritySchema)


