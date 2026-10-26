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

