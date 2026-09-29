export interface MockInterviewSession {
  questionCount: number;
  startedAt: Date;
  completedAt: Date;
}

export interface DifficultyLevel {
  difficultyLevel: "Easy" | "Medium" | "Hard";
}

export interface AiResponsePerQuestion {
  questionText: string;
  userResponse: string;
  score: number;
  timestamp: Date;
  createdAt: Date;
}

export interface InterviewFeedbackScore {
  aiMatchRating: number;
  createdAt: Date;
}

export interface FeedbackCriteria {
  criteria: "Strengths" | "Improvements" | "Model Answer";
}

export interface ChatMessage {
  sender: "user" | "ai";
  messageText: string;
  messageType: string;
  timestamp: Date;
}
