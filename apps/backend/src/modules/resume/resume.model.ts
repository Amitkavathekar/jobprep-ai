import { Schema, model } from "mongoose"

const JobResumeSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume_skills_id: {
      type: Schema.Types.ObjectId,
      ref: "ResumeSkill",
    },

    cource_certification_id: {
      type: Schema.Types.ObjectId,
      ref: "CourseCertification",
    },
    resume_project_id: {
      type: Schema.Types.ObjectId,
      ref: "ResumeProject",
    },

    job_description_raw: {
      type: String,
      required: true,
    },

    resume_title: {
      type: String,
      required: true,
    },

    resume_summary: {
      type: String,
      required: true,
    },

    total_experience: {
      type: Number,
      required: true,
    },

    job_title: {
      type: String,
      required: true,
    },

    latest_company_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const JobResume = model("JobResume", JobResumeSchema)


