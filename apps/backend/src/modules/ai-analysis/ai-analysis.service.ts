import { GeminiService } from '../../services/gemini.service.js';

export class AIAnalysisService {
  public static async getCareerAdvice(targetRole: string, currentSkills: string[]) {
    const prompt = `
Give detailed career progression and skill gap advice for someone aspiring to be a ${targetRole}.
Their current skills: ${currentSkills.join(', ')}.

Provide JSON output:
{
  "recommendedSkills": ["string"],
  "learningRoadmap": ["Step 1...", "Step 2..."],
  "careerOutlook": "string summary"
}
`;

    try {
      return await GeminiService.generateJSON(prompt);
    } catch {
      return {
        recommendedSkills: ['System Design', 'Cloud Platforms (AWS/GCP)', 'Kubernetes'],
        learningRoadmap: [
          'Master Advanced TypeScript & Backend Architecture',
          'Learn Containerization with Docker & Kubernetes',
          'Practice System Design Interview Questions',
        ],
        careerOutlook: 'High demand with excellent compensation growth.',
      };
    }
  }
}
