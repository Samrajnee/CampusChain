import * as ElectionService from './elections.service.js'
import { sendSuccess, sendError } from '../../lib/apiResponse.js'

export const createElection = async (req, res, next) => {
  try {
    const election = await ElectionService.createElection({ ...req.body, createdBy: req.user.id })
    return sendSuccess(res, { election }, 'Election created', 201)
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const listElections = async (req, res, next) => {
  try {
    const elections = await ElectionService.listElections({ userId: req.user.id, role: req.user.role })
    return sendSuccess(res, { elections })
  } catch (err) {
    next(err)
  }
}

export const getElection = async (req, res, next) => {
  try {
    const election = await ElectionService.getElection(req.params.id, req.user.id)
    return sendSuccess(res, { election })
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const addCandidate = async (req, res, next) => {
  try {
    const candidate = await ElectionService.addCandidate({
      electionId: req.params.id,
      ...req.body,
      actorId: req.user.id,
    })
    return sendSuccess(res, { candidate }, 'Candidate added', 201)
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const updateStatus = async (req, res, next) => {
  try {
    const election = await ElectionService.updateElectionStatus({
      id: req.params.id,
      status: req.body.status,
      actorId: req.user.id,
    })
    return sendSuccess(res, { election }, 'Election status updated')
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const castVote = async (req, res, next) => {
  try {
    const result = await ElectionService.castVote({
      electionId: req.params.id,
      candidateId: req.body.candidateId,
      userId: req.user.id,
    })
    return sendSuccess(res, result, 'Vote cast successfully')
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const getResults = async (req, res, next) => {
  try {
    const results = await ElectionService.getResults(req.params.id)
    return sendSuccess(res, results)
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const deleteElection = async (req, res, next) => {
  try {
    await ElectionService.deleteElection(req.params.id, req.user.id)
    return sendSuccess(res, {}, 'Election deleted')
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}