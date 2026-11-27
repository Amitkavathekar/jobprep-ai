import { Schema, Types, model } from "mongoose";

const JobResumeSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    resume_skills_id: {
      type: Types.ObjectId,
      ref: "ResumeSkill",
    },
    cource_certification_id: {
      type: Types.ObjectId,
      ref: "CourseCertification",
    },
    resume_project_id: {
      type: Types.ObjectId,
      ref: "ResumeProject",
    },
    job_description_raw: {
      type: String,
      required: false,
      default: "",
    },
    resume_title: {
      type: String,
      required: true,
      default: "Resume",
    },
    resume_summary: {
      type: String,
      required: true,
      default: "",
    },
    total_experience: {
      type: Number,
      required: true,
      default: 0,
    },
    job_title: {
      type: String,
      required: true,
      default: "Candidate",
    },
    latest_company_name: {
      type: String,
      required: true,
      default: "N/A",
    },
    candidate_name: {
      type: String,
      default: "",
    },
    contact_info: {
      type: String,
      default: "",
    },
    resume_raw_text: {
      type: String,
      default: "",
    },
    resume_sections: {
      type: Schema.Types.Mixed,
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: {
      type: Schema.Types.Mixed,
      default: [],
    },
    education: {
      type: Schema.Types.Mixed,
      default: [],
    },
    work_experience: {
      type: Schema.Types.Mixed,
      default: [],
    },
    file_name: {
      type: String,
      default: "",
    },
    file_size: {
      type: Number,
      default: 0,
    },
    ats_score: {
      type: Number,
      default: 0,
    },
    is_pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

JobResumeSchema.index({ user_id: 1, is_pinned: -1, updatedAt: -1 });

export const JobResume = model("JobResume", JobResumeSchema);
