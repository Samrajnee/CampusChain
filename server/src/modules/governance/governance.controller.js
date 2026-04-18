import * as GovService from './governance.service.js'
import { sendSuccess, sendError } from '../../lib/apiResponse.js'

// ── Proposals ─────────────────────────────────────────────

export const createProposal = async (req, res, next) => {
  try {
    const proposal = await GovService.createProposal({ ...req.body, authorId: req.user.id })
    return sendSuccess(res, { proposal }, 'Proposal submitted', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listProposals = async (req, res, next) => {
  try {
    const proposals = await GovService.listProposals(req.user.id)
    return sendSuccess(res, { proposals })
  } catch (err) { next(err) }
}

export const getProposal = async (req, res, next) => {
  try {
    const proposal = await GovService.getProposal(req.params.id, req.user.id)
    return sendSuccess(res, { proposal })
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const voteOnProposal = async (req, res, next) => {
  try {
    const result = await GovService.voteOnProposal({ proposalId: req.params.id, userId: req.user.id, isUpvote: req.body.isUpvote })
    return sendSuccess(res, result, 'Vote recorded')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const updateProposalStatus = async (req, res, next) => {
  try {
    const proposal = await GovService.updateProposalStatus({ id: req.params.id, ...req.body, actorId: req.user.id })
    return sendSuccess(res, { proposal }, 'Status updated')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const deleteProposal = async (req, res, next) => {
  try {
    await GovService.deleteProposal(req.params.id, req.user.id)
    return sendSuccess(res, {}, 'Proposal removed')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

// ── Grievances ────────────────────────────────────────────

export const createGrievance = async (req, res, next) => {
  try {
    const grievance = await GovService.createGrievance({ ...req.body, studentId: req.user.id })
    return sendSuccess(res, { grievance }, 'Grievance submitted', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listGrievances = async (req, res, next) => {
  try {
    const grievances = await GovService.listGrievances({ userId: req.user.id, role: req.user.role })
    return sendSuccess(res, { grievances })
  } catch (err) { next(err) }
}

export const getGrievance = async (req, res, next) => {
  try {
    const grievance = await GovService.getGrievance({ id: req.params.id, userId: req.user.id, role: req.user.role })
    return sendSuccess(res, { grievance })
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const updateGrievanceStatus = async (req, res, next) => {
  try {
    const grievance = await GovService.updateGrievanceStatus({ id: req.params.id, ...req.body, actorId: req.user.id })
    return sendSuccess(res, { grievance }, 'Status updated')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

// ── Polls ─────────────────────────────────────────────────

export const createPoll = async (req, res, next) => {
  try {
    const poll = await GovService.createPoll({ ...req.body, createdBy: req.user.id })
    return sendSuccess(res, { poll }, 'Poll created', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listPolls = async (req, res, next) => {
  try {
    const polls = await GovService.listPolls(req.user.id)
    return sendSuccess(res, { polls })
  } catch (err) { next(err) }
}

export const respondToPoll = async (req, res, next) => {
  try {
    const result = await GovService.respondToPoll({ pollId: req.params.id, ...req.body, userId: req.user.id })
    return sendSuccess(res, result, 'Response recorded')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}