import { z } from 'zod';

export const coachRequestSchema = z.object({
  mode: z.enum(['explain_move', 'jargon', 'improve', 'risk', 'learn']).default('improve'),
  question: z.string().trim().min(1).max(4000),
  context: z.string().max(12000).optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    id: z.string().max(200),
    role: z.enum(['user', 'assistant']),
    parts: z.array(z.record(z.string(), z.unknown())).max(20),
  })).min(1).max(40),
});

export const quoteRequestSchema = z.object({
  symbols: z.array(z.string().trim().min(1).max(16).regex(/^[A-Za-z0-9^.=\-]+$/)).max(80),
});