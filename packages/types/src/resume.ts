export interface JobResume {
  jobDescriptionRaw: string;
  resumeTitle: string;
  resumeSummary: string;
  totalExperience: number;
  jobTitle: string;
  latestCompanyName: string;
}

export interface ResumeSkill {
  skillName: string[];
}

export interface CourseCertification {
  courseName: string;
  issuerCompanyName: string;
  issueDate: string;
  credentialUrl: string;
}

export interface ResumeProject {
  projectName: string;
  description: string;
  projectUrl: string;
}

export interface TechnologyType {
  technologyName: string;
  typeName: string;
  description: string;
}

export interface ResumeVersion {
  versionNumber: string;
  fileUrl: string;
}
