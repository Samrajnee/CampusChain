import * as CampusOpsService from './campus-ops.service.js'
import { sendSuccess, sendError } from '../../lib/apiResponse.js'

// Events
export const createEvent = async (req, res, next) => {
  try {
    const event = await CampusOpsService.createEvent({ ...req.body, createdById: req.user.id })
    return sendSuccess(res, { event }, 'Event created', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listEvents = async (req, res, next) => {
  try {
    const events = await CampusOpsService.listEvents()
    return sendSuccess(res, { events })
  } catch (err) { next(err) }
}

export const getEvent = async (req, res, next) => {
  try {
    const event = await CampusOpsService.getEvent(req.params.id, req.user.id)
    return sendSuccess(res, { event })
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const rsvpEvent = async (req, res, next) => {
  try {
    const result = await CampusOpsService.rsvpEvent({ eventId: req.params.id, userId: req.user.id })
    return sendSuccess(res, result, result.message)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const markAttendance = async (req, res, next) => {
  try {
    const attendance = await CampusOpsService.markAttendance({
      eventId: req.params.id,
      studentId: req.body.studentId,
      markedById: req.user.id,
      method: req.body.method,
    })
    return sendSuccess(res, { attendance }, 'Attendance marked')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const qrCheckIn = async (req, res, next) => {
  try {
    const attendance = await CampusOpsService.checkInByQr({
      qrCode: req.body.qrCode,
      userId: req.body.userId,
      markedById: req.user.id,
    })
    return sendSuccess(res, { attendance }, 'Check-in successful')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const updateEventStatus = async (req, res, next) => {
  try {
    const event = await CampusOpsService.updateEventStatus({ id: req.params.id, status: req.body.status, actorId: req.user.id })
    return sendSuccess(res, { event }, 'Event status updated')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const deleteEvent = async (req, res, next) => {
  try {
    await CampusOpsService.deleteEvent(req.params.id, req.user.id)
    return sendSuccess(res, {}, 'Event deleted')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

// Clubs
export const createClub = async (req, res, next) => {
  try {
    const club = await CampusOpsService.createClub({ ...req.body, createdById: req.user.id })
    return sendSuccess(res, { club }, 'Club created', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listClubs = async (req, res, next) => {
  try {
    const clubs = await CampusOpsService.listClubs()
    return sendSuccess(res, { clubs })
  } catch (err) { next(err) }
}

export const getClub = async (req, res, next) => {
  try {
    const club = await CampusOpsService.getClub(req.params.id, req.user.id)
    return sendSuccess(res, { club })
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const joinClub = async (req, res, next) => {
  try {
    const member = await CampusOpsService.joinClub({ clubId: req.params.id, userId: req.user.id })
    return sendSuccess(res, { member }, 'Joined club successfully')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const leaveClub = async (req, res, next) => {
  try {
    await CampusOpsService.leaveClub({ clubId: req.params.id, userId: req.user.id })
    return sendSuccess(res, {}, 'Left club successfully')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const updateClubStatus = async (req, res, next) => {
  try {
    const club = await CampusOpsService.updateClubStatus({ id: req.params.id, ...req.body, actorId: req.user.id })
    return sendSuccess(res, { club }, 'Club status updated')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

// Budget
export const createBudgetRequest = async (req, res, next) => {
  try {
    const budget = await CampusOpsService.createBudgetRequest({ ...req.body, requestedBy: req.user.id })
    return sendSuccess(res, { budget }, 'Budget request submitted', 201)
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}

export const listBudgetRequests = async (req, res, next) => {
  try {
    const budgets = await CampusOpsService.listBudgetRequests({ clubId: req.query.clubId, role: req.user.role })
    return sendSuccess(res, { budgets })
  } catch (err) { next(err) }
}

export const updateBudgetStatus = async (req, res, next) => {
  try {
    const budget = await CampusOpsService.updateBudgetStatus({ id: req.params.id, ...req.body, actorId: req.user.id })
    return sendSuccess(res, { budget }, 'Budget request updated')
  } catch (err) { if (err.status) return sendError(res, err.message, err.status); next(err) }
}