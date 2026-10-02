import { Schema, model } from "mongoose"

const CourseCertificationSchema = new Schema(
  {
    job_resume_id: {
      type: Schema.Types.ObjectId,
      ref: "JobResume",
      required: true,
    },

    course_name: {
      type: String,
      required: true,
    },

    issuer: {
      type: String,
      required: true,
    },

    issue_date: {
      type: Date,
      required: true,
    },

    credential_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
)

export const CourseCertification = model(
  "CourseCertification",
  CourseCertificationSchema
)
