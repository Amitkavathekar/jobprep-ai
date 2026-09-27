import { Schema, model, Document } from 'mongoose';

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'My Resume' },
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    summary: { type: String, default: '' },
    experience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        isCurrent: Boolean,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        startDate: String,
        endDate: String,
      },
    ],
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    templateId: { type: String, default: 'modern' },
  },
  { timestamps: true }
);

export const ResumeModel = model<IResume>('Resume', resumeSchema);
