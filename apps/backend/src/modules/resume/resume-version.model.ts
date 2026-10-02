import { Schema, model } from "mongoose";

const ResumeVersionSchema = new Schema(
  {
    resume_versions_id: {
      type: Schema.Types.ObjectId,
      unique: true,
    },
    job_resume_id: {
      type: Schema.Types.ObjectId,
      ref: "JobResume",
      required: true,
    },
    version_number: {
      type: String,
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ResumeVersion = model("ResumeVersion", ResumeVersionSchema);

