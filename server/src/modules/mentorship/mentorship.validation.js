import { z } from 'zod';

export const createRequestSchema = z.object({
  topic: z.string().min(5).max(150),
  description: z.string().min(20).max(1000),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'CLOSED']),
  note: z.string().max(500).optional(),
});