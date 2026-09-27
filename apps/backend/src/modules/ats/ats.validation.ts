import { z } from 'zod';

export const analyzeATSBodySchema = z.object({
  body: z.object({
    jobTitle: z.string().optional(),
    jobDescription: z.string().optional(),
  }),
});
