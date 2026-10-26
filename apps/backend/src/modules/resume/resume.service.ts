import { Types } from "mongoose";
import { JobResume } from "./resume.model";
import { extractResumeText } from "../../services/pdf-parser.service";

export interface CreateResumeDto {
  resume_title?: string;
  candidate_name?: string;
  contact_info?: string;
  job_title?: string;
  latest_company_name?: string;
  total_experience?: number;
  resume_summary?: string;
  skills?: string[] | string;
  projects?: any[];
  education?: any[];
  work_experience?: any[];
  resume_sections?: any[];
  job_description_raw?: string;
  resume_raw_text?: string;
  ats_score?: number;
  is_pinned?: boolean;
}

export interface UpdateResumeDto extends Partial<CreateResumeDto> {}

function parseSkills(skillsInput?: string[] | string): string[] {
  if (!skillsInput) return [];
  if (Array.isArray(skillsInput)) {
    return skillsInput.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof skillsInput === "string") {
    return skillsInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function buildSectionsFromResumeData(data: CreateResumeDto): any[] {
  const sections: any[] = [];

  if (data.candidate_name || data.contact_info) {
    sections.push({
      title: data.candidate_name || "Candidate",
      isHeader: true,
      content: data.contact_info || "",
    });
  }

  if (data.resume_summary) {
    sections.push({
      title: "Professional Summary",
      content: data.resume_summary,
    });
  }

  const skillsList = parseSkills(data.skills);
  if (skillsList.length > 0) {
    sections.push({
      title: "Key Skills",
      content: skillsList.join(", "),
      highlights: skillsList,
    });
  }

  if (Array.isArray(data.work_experience) && data.work_experience.length > 0) {
    data.work_experience.forEach((exp: any) => {
      const company = exp.company || exp.employer || "";
      const position = exp.position || exp.role || exp.title || "Role";
      const duration = exp.duration || exp.dates || exp.year || "";
      const desc = exp.description || exp.responsibilities || exp.content || "";
      sections.push({
        title: company ? `${position} at ${company}` : position,
        content: duration ? `${duration}\n${desc}` : desc,
        highlights: exp.technologies || [],
      });
    });
  }

  if (Array.isArray(data.projects) && data.projects.length > 0) {
    data.projects.forEach((proj: any) => {
      const name = proj.name || proj.title || "Project";
      const desc = proj.description || proj.content || "";
      const tech = proj.technologies || proj.techStack || "";
      sections.push({
        title: name,
        content: tech ? `${desc}\nTechnologies: ${Array.isArray(tech) ? tech.join(", ") : tech}` : desc,
        highlights: Array.isArray(tech) ? tech : [],
      });
    });
  }

  if (Array.isArray(data.education) && data.education.length > 0) {
    data.education.forEach((edu: any) => {
      const degree = edu.degree || edu.title || "";
      const institution = edu.institution || edu.school || edu.college || "";
      const year = edu.year || edu.duration || "";
      sections.push({
        title: degree || "Education",
        content: [institution, year].filter(Boolean).join(" · "),
      });
    });
  }

  return sections;
}

export async function getUserResumes(
  userId: string,
  options: { search?: string; sort?: string } = {}
) {
  if (!Types.ObjectId.isValid(userId)) {
    return [];
  }

  const userObjectId = new Types.ObjectId(userId);
  const query: Record<string, any> = { user_id: userObjectId };

  if (options.search && options.search.trim()) {
    const searchRegex = new RegExp(options.search.trim(), "i");
    query.$or = [
      { resume_title: searchRegex },
      { job_title: searchRegex },
      { candidate_name: searchRegex },
      { latest_company_name: searchRegex },
      { skills: searchRegex },
    ];
  }

  const resumes = await JobResume.find(query)
    .sort({ is_pinned: -1, updatedAt: -1, createdAt: -1 })
    .lean();

  return resumes;
}

export async function getResumeById(userId: string, resumeId: string) {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(resumeId)) {
    return null;
  }

  const resume = await JobResume.findOne({
    _id: new Types.ObjectId(resumeId),
    user_id: new Types.ObjectId(userId),
  }).lean();

  return resume;
}

export async function createResume(userId: string, data: CreateResumeDto) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skillsList = parseSkills(data.skills);
  const sections =
    Array.isArray(data.resume_sections) && data.resume_sections.length > 0
      ? data.resume_sections
      : buildSectionsFromResumeData(data);

  const doc = await JobResume.create({
    user_id: new Types.ObjectId(userId),
    resume_title: data.resume_title?.trim() || "My Resume",
    candidate_name: data.candidate_name?.trim() || "",
    contact_info: data.contact_info?.trim() || "",
    job_title: data.job_title?.trim() || "Candidate",
    latest_company_name: data.latest_company_name?.trim() || "N/A",
    total_experience:
      typeof data.total_experience === "number" ? data.total_experience : 0,
    resume_summary: data.resume_summary?.trim() || "",
    skills: skillsList,
    projects: Array.isArray(data.projects) ? data.projects : [],
    education: Array.isArray(data.education) ? data.education : [],
    work_experience: Array.isArray(data.work_experience) ? data.work_experience : [],
    resume_sections: sections,
    job_description_raw: data.job_description_raw || "",
    resume_raw_text: data.resume_raw_text || "",
    ats_score: typeof data.ats_score === "number" ? data.ats_score : 0,
    is_pinned: Boolean(data.is_pinned),
  });

  return doc;
}

export async function updateResume(
  userId: string,
  resumeId: string,
  data: UpdateResumeDto
) {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(resumeId)) {
    return null;
  }

  const existing = await JobResume.findOne({
    _id: new Types.ObjectId(resumeId),
    user_id: new Types.ObjectId(userId),
  });

  if (!existing) {
    return null;
  }

  if (data.resume_title !== undefined) existing.resume_title = data.resume_title.trim();
  if (data.candidate_name !== undefined) existing.candidate_name = data.candidate_name.trim();
  if (data.contact_info !== undefined) existing.contact_info = data.contact_info.trim();
  if (data.job_title !== undefined) existing.job_title = data.job_title.trim();
  if (data.latest_company_name !== undefined) existing.latest_company_name = data.latest_company_name.trim();
  if (data.total_experience !== undefined) existing.total_experience = Number(data.total_experience) || 0;
  if (data.resume_summary !== undefined) existing.resume_summary = data.resume_summary.trim();
  if (data.skills !== undefined) existing.skills = parseSkills(data.skills);
  if (data.projects !== undefined) existing.projects = data.projects;
  if (data.education !== undefined) existing.education = data.education;
  if (data.work_experience !== undefined) (existing as any).work_experience = data.work_experience;
  if (data.job_description_raw !== undefined) existing.job_description_raw = data.job_description_raw;
  if (data.resume_raw_text !== undefined) existing.resume_raw_text = data.resume_raw_text;
  if (data.ats_score !== undefined) (existing as any).ats_score = Number(data.ats_score) || 0;
  if (data.is_pinned !== undefined) (existing as any).is_pinned = Boolean(data.is_pinned);

  if (Array.isArray(data.resume_sections) && data.resume_sections.length > 0) {
    existing.resume_sections = data.resume_sections;
  } else if (
    data.skills !== undefined ||
    data.work_experience !== undefined ||
    data.education !== undefined ||
    data.resume_summary !== undefined
  ) {
    existing.resume_sections = buildSectionsFromResumeData({
      candidate_name: existing.candidate_name,
      contact_info: existing.contact_info,
      resume_summary: existing.resume_summary,
      skills: existing.skills,
      work_experience: (existing as any).work_experience,
      education: existing.education,
      projects: existing.projects,
    });
  }

  await existing.save();
  return existing;
}

export async function deleteResume(userId: string, resumeId: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(resumeId)) {
    return false;
  }

  const result = await JobResume.deleteOne({
    _id: new Types.ObjectId(resumeId),
    user_id: new Types.ObjectId(userId),
  });

  return (result.deletedCount ?? 0) > 0;
}

export async function togglePinResume(userId: string, resumeId: string) {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(resumeId)) {
    return null;
  }

  const resume = await JobResume.findOne({
    _id: new Types.ObjectId(resumeId),
    user_id: new Types.ObjectId(userId),
  });

  if (!resume) {
    return null;
  }

  (resume as any).is_pinned = !(resume as any).is_pinned;
  await resume.save();
  return resume;
}

export async function duplicateResume(userId: string, resumeId: string) {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(resumeId)) {
    return null;
  }

  const original = await JobResume.findOne({
    _id: new Types.ObjectId(resumeId),
    user_id: new Types.ObjectId(userId),
  }).lean();

  if (!original) {
    return null;
  }

  const duplicateData: any = {
    ...original,
    _id: undefined,
    resume_title: `${original.resume_title || "Resume"} (Copy)`,
    user_id: new Types.ObjectId(userId),
    is_pinned: false,
    createdAt: undefined,
    updatedAt: undefined,
  };

  const newResume = await JobResume.create(duplicateData);
  return newResume;
}

export async function uploadAndCreateResume(
  userId: string,
  file: Express.Multer.File,
  options: { title?: string; jobTitle?: string } = {}
) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const rawText = await extractResumeText(file);

  // Simple heuristic parsing from extracted raw text
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const candidateName = lines[0] ? lines[0].slice(0, 60) : "Candidate";

  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const contactParts: string[] = [];
  if (emailMatch) contactParts.push(emailMatch[0]);
  if (phoneMatch) contactParts.push(phoneMatch[0]);

  // Extract skills keywords
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
    "Python", "Java", "SQL", "MongoDB", "PostgreSQL", "HTML", "CSS", "Tailwind CSS",
    "Docker", "AWS", "Git", "GitHub", "REST API", "GraphQL", "Redux", "Figma",
    "C++", "C#", "Go", "Rust", "Linux", "Kubernetes", "CI/CD", "Agile", "Scrum"
  ];
  const detectedSkills = commonSkills.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(rawText)
  );

  const cleanFileName = file.originalname.replace(/\.[^/.]+$/, "");
  const title = options.title || cleanFileName || "Uploaded Resume";

  const sections = [
    {
      title: candidateName,
      isHeader: true,
      content: contactParts.join(" · ") || lines.slice(0, 3).join(" · "),
    },
    {
      title: "Extracted Content",
      content: rawText.slice(0, 2000),
      highlights: detectedSkills,
    },
  ];

  const doc = await JobResume.create({
    user_id: new Types.ObjectId(userId),
    resume_title: title,
    candidate_name: candidateName,
    contact_info: contactParts.join(" · "),
    job_title: options.jobTitle || "Candidate",
    latest_company_name: "N/A",
    total_experience: 0,
    resume_summary: rawText.slice(0, 400),
    skills: detectedSkills,
    resume_sections: sections,
    resume_raw_text: rawText,
    file_name: file.originalname,
    file_size: file.size,
    job_description_raw: "",
    ats_score: 0,
    is_pinned: false,
  });

  return doc;
}
