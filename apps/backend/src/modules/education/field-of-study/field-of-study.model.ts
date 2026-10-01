import { model, Schema } from "mongoose";

const fieldOfStudySchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },{
    timestamps: true,
  }
);

export const FieldOfStudy = model(
  "FieldOfStudy",
  fieldOfStudySchema
);
