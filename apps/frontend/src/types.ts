export type Screen =
  | "job-resume"
  | "ai-analysis"
  | "resume-editor"
  | "ats-analysis"
  | "interview-prep"
  | "mock-interview"
  | "reports"
  | "dashboard"
  | (string & {});

export interface Coupon {
  id?: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  status: "Active" | "Expired";
  applicablePlans: string[];
  expiresAt?: string;
}

export interface SupportTicket {
  id: string;
  category: "Technical Issue" | "Billing & Payment" | "Resume AI / ATS" | "Mock Interview" | "Account & Other" | string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  status?: string;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

