export interface AtsAnalysisCombinedReport {
  overallMatchScore: number;
  atsParseScore: number;
  matchedSkills: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface MockInterviewReport {
  role: string;
  interviewDate: Date;
  durationMinutes: number;
  attemptedQuestions: number;
  grade: string;
  techAccuracy: number;
  communication: number;
  problemSolving: number;
  questionFeedback: string[];
}
