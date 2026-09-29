export interface User {
  fullName: string;
  email: string;
  portfolioUrl: string;
  professionalTitle: string;
  bio: string;
  avatarUrl: string;
  phoneNo: string;
  github: string;
  linkedin: string;
  location: string;
}

export interface EducationDegree {
  degreeName: string;
  fieldOfStudy: string;
  institution: string;
  startYear: number;
  endYear: number;
}
