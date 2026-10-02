import { Schema, model } from "mongoose";

const StatusSchema = new Schema({
  status_id: {
    type: Schema.Types.ObjectId,
    unique: true,
  },
  status_name: {
    type: String,
    enum: ["completed", "in-progress"],
    required: true,
  },
});

export const Status = model("Status", StatusSchema);

