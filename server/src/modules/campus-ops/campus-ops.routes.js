import { Router } from 'express'
import * as Controller from './campus-ops.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import {
  createEventSchema, updateEventStatusSchema, markAttendanceSchema, qrCheckInSchema,
  createClubSchema, updateClubStatusSchema,
  createBudgetSchema, updateBudgetStatusSchema,
} from './campus-ops.validation.js'

const router = Router()
router.use(authenticate)

// Events
router.get('/events', Controller.listEvents)
router.post('/events', authorize('TEACHER'), validate(createEventSchema), Controller.createEvent)
router.get('/events/:id', Controller.getEvent)
router.post('/events/:id/rsvp', Controller.rsvpEvent)
router.post('/events/:id/attendance', authorize('TEACHER'), validate(markAttendanceSchema), Controller.markAttendance)
router.post('/events/qr-checkin', authorize('TEACHER'), validate(qrCheckInSchema), Controller.qrCheckIn)
router.patch('/events/:id/status', authorize('TEACHER'), validate(updateEventStatusSchema), Controller.updateEventStatus)
router.delete('/events/:id', authorize('HOD'), Controller.deleteEvent)

// Clubs
router.get('/clubs', Controller.listClubs)
router.post('/clubs', validate(createClubSchema), Controller.createClub)
router.get('/clubs/:id', Controller.getClub)
router.post('/clubs/:id/join', Controller.joinClub)
router.post('/clubs/:id/leave', Controller.leaveClub)
router.patch('/clubs/:id/status', authorize('HOD'), validate(updateClubStatusSchema), Controller.updateClubStatus)

// Budget
router.get('/budget', Controller.listBudgetRequests)
router.post('/budget', validate(createBudgetSchema), Controller.createBudgetRequest)
router.patch('/budget/:id', authorize('HOD'), validate(updateBudgetStatusSchema), Controller.updateBudgetStatus)

export default router