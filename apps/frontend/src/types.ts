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

export type AdminScreen =
  | "admin-dashboard"
  | "admin-membership"
  | "admin-coupons"
  | "admin-users"
  | "admin-support"
  | "admin-ai-models"
  | "admin-notifications"
  | "admin-activity-log"
  | (string & {});

export interface Coupon {
  id?: string;
  code: string;
  discountType: "Percentage" | "Flat Amount" | "Fixed";
  discountValue: number;
  status: "Active" | "Expired" | "Draft";
  applicablePlans: string[];
  usageLimit?: number;
  timesUsed?: number;
  expiryDate?: string;
  expiresAt?: string;
}

export interface SupportTicket {
  id: string;
  supportTicketId?: string;
  category: "Technical Issue" | "Billing & Payment" | "Resume AI" | "Resume AI / ATS" | "Mock Interview" | "Account & Other" | string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  status: "Open" | "In Progress" | "Resolved" | "Closed" | string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  adminResponse?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  responses?: Array<{
    responder: string;
    message: string;
    createdAt?: string | Date;
  }>;
}

export interface ActivityLogItem {
  id: string;
  adminName: string;
  action: string;
  target: string;
  type: "Pricing" | "User Action" | "Coupon" | "Settings" | "Content" | string;
  timestamp: string;
}
