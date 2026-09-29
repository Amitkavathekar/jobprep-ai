export interface QuestionCategory {
  categoryTitle: string;
  categoryDescription: string;
}

export interface Question {
  question: string;
  answer: string;
  tags: string[];
}

export interface StudyPlan {
  day: number;
  topic: string;
  totalQuestions: number;
}

export interface Status {
  statusName: "completed" | "in-progress";
}
