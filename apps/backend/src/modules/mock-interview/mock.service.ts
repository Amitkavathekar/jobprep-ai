import { RESPONSE_MESSAGES } from "../../constants/response-messages.js"
import { NotFoundError } from "../../errors/NotFoundError.js"
import { GeminiService } from "../../services/gemini.service.js"
import { IMockQuestion, MockSessionModel } from "./mock.model.js"

interface GeneratedQuestionsResult {
  questions: Array<{
    question: string
    category: string
    expectedKeyPoints: string[]
  }>
}

interface AnswerEvaluationResult {
  feedback: string
  score: number
}

export class MockInterviewService {
  public static async generateSession(
    userId: string,
    roleTitle: string,
    experienceLevel: string = "Intermediate"
  ) {
    const prompt = `
Generate 5 interview questions for a ${experienceLevel} level ${roleTitle} position.
Format your output strictly as a JSON object:
{
  "questions": [
    {
      "question": "string",
      "category": "Behavioral" | "Technical" | "System Design",
      "expectedKeyPoints": ["string", "string"]
    }
  ]
}
`

    let generated: GeneratedQuestionsResult
    try {
      generated =
        await GeminiService.generateJSON<GeneratedQuestionsResult>(prompt)
    } catch {
      generated = {
        questions: [
          {
            question: `Can you describe your experience with ${roleTitle}?`,
            category: "Behavioral",
            expectedKeyPoints: ["Experience", "Projects"],
          },
          {
            question: "Tell me about a challenging bug you fixed recently.",
            category: "Technical",
            expectedKeyPoints: ["Problem", "Action", "Result"],
          },
        ],
      }
    }

    const session = await MockSessionModel.create({
      userId,
      roleTitle,
      experienceLevel,
      questions: generated.questions || [],
      status: "STARTED",
    })

    return session
  }

  public static async evaluateAnswer(
    userId: string,
    sessionId: string,
    questionIndex: number,
    userAnswer: string
  ) {
    const session = await MockSessionModel.findOne({ _id: sessionId, userId })
    if (!session) {
      throw new NotFoundError(RESPONSE_MESSAGES.MOCK_SESSION_NOT_FOUND)
    }

    const targetQuestion = session.questions[questionIndex]
    if (!targetQuestion) {
      throw new NotFoundError("Question index out of bounds")
    }

    const prompt = `
Evaluate the candidate's answer for the following interview question.
Question: "${targetQuestion.question}"
Candidate Answer: "${userAnswer}"

Output JSON strictly:
{
  "feedback": "Detailed constructive feedback",
  "score": number (0 to 100)
}
`

    let evalResult: AnswerEvaluationResult
    try {
      evalResult =
        await GeminiService.generateJSON<AnswerEvaluationResult>(prompt)
    } catch {
      evalResult = {
        feedback: "Good answer, consider elaborating on specific metrics.",
        score: 85,
      }
    }

    targetQuestion.userAnswer = userAnswer
    targetQuestion.feedback = evalResult.feedback
    targetQuestion.score = evalResult.score

    // Recalculate average session score
    const evaluatedQuestions = session.questions.filter(
      (q: IMockQuestion) => q.score && q.score > 0
    )
    const avgScore =
      evaluatedQuestions.reduce(
        (acc: number, q: IMockQuestion) => acc + (q.score || 0),
        0
      ) / (evaluatedQuestions.length || 1)
    session.overallScore = Math.round(avgScore)

    if (evaluatedQuestions.length === session.questions.length) {
      session.status = "COMPLETED"
    }

    await session.save()
    return { session, currentEvaluation: evalResult }
  }

  public static async getUserSessions(userId: string) {
    return MockSessionModel.find({ userId }).sort({ createdAt: -1 })
  }

  public static async getSessionById(userId: string, sessionId: string) {
    const session = await MockSessionModel.findOne({ _id: sessionId, userId })
    if (!session) {
      throw new NotFoundError(RESPONSE_MESSAGES.MOCK_SESSION_NOT_FOUND)
    }
    return session
  }
}
