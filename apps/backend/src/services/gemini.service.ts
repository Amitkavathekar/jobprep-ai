import { getGeminiClient } from '../config/gemini.config.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../errors/ApiError.js';
import { HTTP_STATUS } from '../constants/http-status.js';

export class GeminiService {
  public static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const client = getGeminiClient();
    if (!client) {
      logger.warn('Gemini API client unavailable. Returning fallback mock response.');
      return 'AI Response unavailable due to missing GEMINI_API_KEY configuration.';
    }

    try {
      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini Service Error:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to process AI request.');
    }
  }

  public static async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const rawText = await this.generateText(
      `${prompt}\nIMPORTANT: Respond ONLY with a valid JSON object. Do not include markdown code block formatting like \`\`\`json.`,
      systemInstruction
    );

    try {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      logger.error('Failed to parse Gemini JSON response:', rawText);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid response format received from AI.');
    }
  }
}
