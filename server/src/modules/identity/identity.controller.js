import * as IdentityService from './identity.service.js'
import { sendSuccess, sendError } from '../../lib/apiResponse.js'

// Certificates
export const issueCertificate = async (req, res, next) => {
  try {
    const cert = await IdentityService.issueCertificate({ ...req.body, actorId: req.user.id })
    return sendSuccess(res, { certificate: cert }, 'Certificate issued', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listCertificates = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id
    const certs = await IdentityService.listCertificates(userId)
    return sendSuccess(res, { certificates: certs })
  } catch (err) { next(err) }
}

export const verifyCertificate = async (req, res, next) => {
  try {
    const result = await IdentityService.verifyCertificate(req.params.code)
    return sendSuccess(res, result)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const revokeCertificate = async (req, res, next) => {
  try {
    const cert = await IdentityService.revokeCertificate({ id: req.params.id, ...req.body, actorId: req.user.id })
    return sendSuccess(res, { certificate: cert }, 'Certificate revoked')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

// Badges
export const listBadges = async (req, res, next) => {
  try {
    const badges = await IdentityService.listBadges()
    return sendSuccess(res, { badges })
  } catch (err) { next(err) }
}

export const awardBadge = async (req, res, next) => {
  try {
    const userBadge = await IdentityService.awardBadge({ ...req.body, awardedBy: req.user.id })
    return sendSuccess(res, { userBadge }, 'Badge awarded', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const getUserBadges = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id
    const badges = await IdentityService.getUserBadges(userId)
    return sendSuccess(res, { badges })
  } catch (err) { next(err) }
}

export const createBadge = async (req, res, next) => {
  try {
    const badge = await IdentityService.createBadge({ ...req.body, actorId: req.user.id })
    return sendSuccess(res, { badge }, 'Badge created', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

// Profile
export const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await IdentityService.getPublicProfile(req.params.slug)
    return sendSuccess(res, { profile })
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await IdentityService.updateProfile({ userId: req.user.id, data: req.body })
    return sendSuccess(res, { profile }, 'Profile updated')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const getXPTimeline = async (req, res, next) => {
  try {
    const timeline = await IdentityService.getXPTimeline(req.user.id)
    return sendSuccess(res, { timeline })
  } catch (err) { next(err) }
}

// Leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { department, year } = req.query
    const leaderboard = await IdentityService.getLeaderboard({ department, year })
    return sendSuccess(res, { leaderboard })
  } catch (err) { next(err) }
}

// Directory
export const getDirectory = async (req, res, next) => {
  try {
    const { department, year, search } = req.query
    const students = await IdentityService.getDirectory({ department, year, search })
    return sendSuccess(res, { students })
  } catch (err) { next(err) }
}