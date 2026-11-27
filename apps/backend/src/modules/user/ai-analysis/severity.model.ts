import { Schema, model } from "mongoose";

const SeveritySchema = new Schema({
  severity: {
    type: String,
    required: true,
  },
});

export const Severity = model("Severity", SeveritySchema);
