import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(10),
  targetRole: z.enum([
    'STUDENT', 'TEACHER', 'HOD', 'LAB_ASSISTANT',
    'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'
  ]).optional().nullable(),
  targetDept: z.string().optional().nullable(),
  targetYear: z.number().int().min(1).max(6).optional().nullable(),
  isPinned: z.boolean().optional().default(false),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  body: z.string().min(10).optional(),
  targetRole: z.enum([
    'STUDENT', 'TEACHER', 'HOD', 'LAB_ASSISTANT',
    'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'
  ]).optional().nullable(),
  targetDept: z.string().optional().nullable(),
  targetYear: z.number().int().min(1).max(6).optional().nullable(),
  isPinned: z.boolean().optional(),
});