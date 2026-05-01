import { Router } from 'express'
import * as ElectionsController from './elections.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import {
  createElectionSchema,
  addCandidateSchema,
  castVoteSchema,
  updateStatusSchema,
} from './elections.validation.js'

const router = Router()

router.use(authenticate)

// All users
router.get('/', ElectionsController.listElections)
router.get('/:id', ElectionsController.getElection)
router.get('/:id/results', ElectionsController.getResults)
router.post('/:id/vote', validate(castVoteSchema), ElectionsController.castVote)

// Admin and above only
router.post('/', authorize('TEACHER'), validate(createElectionSchema), ElectionsController.createElection)
router.post('/:id/candidates', authorize('TEACHER'), validate(addCandidateSchema), ElectionsController.addCandidate)
router.patch('/:id/status', authorize('TEACHER'), validate(updateStatusSchema), ElectionsController.updateStatus)
router.delete('/:id', authorize('HOD'), ElectionsController.deleteElection)

export default router 