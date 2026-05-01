import { z } from 'zod';

export const studentSearchSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});