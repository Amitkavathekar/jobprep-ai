export interface AiAnalysis {
  matchScore: number;
  workingPoints: string[];
  analyzedAt: Date;
}

export interface JdGap {
  jdGapTitle: string;
  jdGapDescription: string;
}

export interface JdSuggestion {
  section: number;
  suggestionText: string;
}

export interface Severity {
  severity: "red" | "orange" | "blue";
}

export interface MatchLevel {
  matchLevel: "Low Match" | "Moderate Match" | "High Match";
}

export interface Priority {
  difficultyLevel: "mid-level" | "senior" | "staff" | "level";
}
