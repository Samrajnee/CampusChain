import { z } from 'zod'

export const issueCertificateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().max(1000).optional(),
  type: z.enum(['PARTICIPATION', 'ACHIEVEMENT', 'LEADERSHIP', 'ACADEMIC', 'CUSTOM']).optional(),
  issuedBy: z.string().min(2).max(100),
  eventId: z.string().uuid().optional().nullable(),
})

export const revokeCertificateSchema = z.object({
  reason: z.string().min(5).max(300),
})

export const awardBadgeSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  showAddress: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showCgpa: z.boolean().optional(),
  showBloodGroup: z.boolean().optional(),
  showDob: z.boolean().optional(),
  isProfilePublic: z.boolean().optional(),
  portfolioSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens').optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(6).optional(),
  semester: z.number().int().min(1).max(12).optional(),
  section: z.string().optional().nullable(),
  cgpa: z.number().min(0).max(10).optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  hostelName: z.string().optional().nullable(),
})

export const createBadgeSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  category: z.enum(['GOVERNANCE', 'SOCIAL', 'ACADEMIC', 'LEADERSHIP', 'EVENTS', 'FUN']),
  isFun: z.boolean().optional(),
  xpReward: z.number().int().min(0).max(500).optional(),
})