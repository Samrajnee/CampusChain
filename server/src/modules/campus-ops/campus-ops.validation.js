import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(2000).optional(),
  venue: z.string().max(150).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().nullable(),
  maxCapacity: z.number().int().positive().optional().nullable(),
  clubId: z.string().uuid().optional().nullable(),
})

export const updateEventStatusSchema = z.object({
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
})

export const markAttendanceSchema = z.object({
  studentId: z.string().uuid(),
  method: z.enum(['QR', 'MANUAL']).optional(),
})

export const qrCheckInSchema = z.object({
  qrCode: z.string().min(1),
  userId: z.string().uuid(),
})

export const createClubSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
})

export const updateClubStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL']),
  advisorId: z.string().uuid().optional(),
})

export const createBudgetSchema = z.object({
  clubId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().max(1000).optional(),
  amount: z.number().positive(),
})

export const updateBudgetStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'DISBURSED']),
  adminNote: z.string().max(500).optional(),
})