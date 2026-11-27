export const STORAGE_KEYS = {
  USER: "user",
  TOKEN: "token",
  SHOW_COMPLETE_PROFILE_MODAL: "show_complete_profile_modal",
  SUPPORT_TICKETS: "jobprep_support_tickets",
  ADMIN_USERS: "jobprep_admin_users",
  LATEST_ANALYSIS: "jobprep_latest_analysis",
  ANALYSIS_UNLOCKED: "jobprep_analysis_unlocked",
  APPLIED_SUGGESTIONS: "jobprep_applied_suggestion_ids",
  JOB_DESCRIPTION: "jobprep_jd",
  RESUME_META: "jobprep_resume_meta",
} as const;

export const CUSTOM_EVENTS = {
  USER_UPDATED: "user-profile-updated",
  OPEN_MEMBERSHIP_MODAL: "open-membership-modal",
  OPEN_COMPLETE_PROFILE_MODAL: "open-complete-profile-modal",
  OPEN_SUPPORT_MODAL: "open_support_modal",
  SUPPORT_TICKETS_UPDATED: "support_tickets_updated",
  JOBPREP_UNLOCKED: "jobprep_unlocked",
  ADMIN_ACTIVITY_LOGGED: "admin_activity_logged",
  SUBSCRIPTION_UPDATED: "subscription-updated",
} as const;

export const RESUME_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE_LARGE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_EXTENSIONS: [".pdf", ".docx", ".txt"] as const,
  ACCEPTED_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ] as const,
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  CALLBACK: "/callback",
  DASHBOARD: "/user/dashboard",
  RESUME: "/user/resume",
  AI_ANALYSIS: "/user/ai-analysis",
  RESUME_EDITOR: "/user/resume-editor",
  ATS_ANALYSIS: "/user/ats-analysis",
  INTERVIEW_PREP: "/user/interview-prep",
  MOCK_INTERVIEW: "/user/mock-interview",
  REPORTS: "/user/reports",
  PROFILE: "/user/profile",
  SUPPORT: "/user/support",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PLANS: "/admin/plans",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_USERS: "/admin/users",
  ADMIN_SUPPORT: "/admin/support-tickets",
  ADMIN_AI_MODELS: "/admin/ai-models",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_ACTIVITY_LOG: "/admin/activity-log",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_ROLES: "/admin/roles-permissions",
} as const;
