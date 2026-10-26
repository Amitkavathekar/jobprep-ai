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

export interface ResumeSection {
  title: string;
  content: string;
  isHeader?: boolean;
  highlights?: string[];
}

export interface AnalysisData {
  id?: string;
  score: number;
  matchLevel: string;
  workingPoints: string[];
  keywords: {
    matched: string[];
    partial: string[];
    missing: string[];
  };
  gaps: Array<{
    area: string;
    severity: "high" | "medium" | "low";
    detail: string;
  }>;
  suggestions: Array<{
    id: number;
    text: string;
    impact: "high" | "medium" | "low";
    category: string;
  }>;
  resumeSections: ResumeSection[];
  resumeFileName?: string;
  jobDescription?: string;
  createdAt?: string;
}

export interface AIAnalysisProps {
  onNavigate?: (s: Screen) => void;
  onComplete?: () => void;
  hasActiveSubscription?: boolean;
  onOpenUpgradeModal?: () => void;
}
