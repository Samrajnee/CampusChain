import { z } from 'zod'

export const createProposalSchema = z.object({
  title: z.string().min(5).max(150),
  body: z.string().min(20).max(5000),
  isAnonymous: z.boolean().optional(),
})

export const proposalVoteSchema = z.object({
  isUpvote: z.boolean(),
})

export const updateProposalStatusSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']),
  adminNote: z.string().max(500).optional(),
})

export const createGrievanceSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(5000),
  isAnonymous: z.boolean().optional(),
})

export const updateGrievanceStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED']),
  note: z.string().max(500).optional(),
})

export const createPollSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().max(500).optional(),
  options: z.array(z.string().min(1).max(100)).min(2).max(8),
  endsAt: z.string().datetime().optional().nullable(),
})

export const pollResponseSchema = z.object({
  pollOptionId: z.string().uuid(),
})