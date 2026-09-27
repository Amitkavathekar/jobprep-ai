import pdfParse from 'pdf-parse';
import { logger } from '../config/logger.js';
import { BadRequestError } from '../errors/BadRequestError.js';

export class PdfParserService {
  public static async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (error) {
      logger.error('Error parsing PDF buffer:', error);
      throw new BadRequestError('Failed to parse text from the uploaded PDF document.');
    }
  }
}
