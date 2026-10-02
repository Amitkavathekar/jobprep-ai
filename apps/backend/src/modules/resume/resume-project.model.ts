import { Schema, model } from "mongoose";

const ResumeProjectSchema = new Schema(
  {
    technology_type_id: {
      type: Schema.Types.ObjectId,
      ref: "TechnologyType",
      required: true,
    },

    project_name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    project_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true
  },
);

export const ResumeProject = model("ResumeProject", ResumeProjectSchema);


