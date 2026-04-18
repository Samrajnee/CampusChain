import { z } from 'zod'

export const createElectionSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isAnonymous: z.boolean().optional(),
  eligibleYear: z.number().int().min(1).max(6).optional().nullable(),
  eligibleDept: z.string().optional().nullable(),
})

export const addCandidateSchema = z.object({
  userId: z.string().uuid(),
  position: z.string().min(2).max(100),
  manifesto: z.string().max(2000).optional(),
})

export const castVoteSchema = z.object({
  candidateId: z.string().uuid(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED']),
})