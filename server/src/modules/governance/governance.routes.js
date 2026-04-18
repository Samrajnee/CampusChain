import { Router } from 'express'
import * as GovController from './governance.controller.js'
import authenticate from '../../middleware/authenticate.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import {
  createProposalSchema, proposalVoteSchema, updateProposalStatusSchema,
  createGrievanceSchema, updateGrievanceStatusSchema,
  createPollSchema, pollResponseSchema,
} from './governance.validation.js'

const router = Router()
router.use(authenticate)

// Proposals
router.get('/proposals', GovController.listProposals)
router.post('/proposals', validate(createProposalSchema), GovController.createProposal)
router.get('/proposals/:id', GovController.getProposal)
router.post('/proposals/:id/vote', validate(proposalVoteSchema), GovController.voteOnProposal)
router.patch('/proposals/:id/status', authorize('TEACHER'), validate(updateProposalStatusSchema), GovController.updateProposalStatus)
router.delete('/proposals/:id', GovController.deleteProposal)

// Grievances
router.get('/grievances', GovController.listGrievances)
router.post('/grievances', validate(createGrievanceSchema), GovController.createGrievance)
router.get('/grievances/:id', GovController.getGrievance)
router.patch('/grievances/:id/status', authorize('TEACHER'), validate(updateGrievanceStatusSchema), GovController.updateGrievanceStatus)

// Polls
router.get('/polls', GovController.listPolls)
router.post('/polls', authorize('TEACHER'), validate(createPollSchema), GovController.createPoll)
router.post('/polls/:id/respond', validate(pollResponseSchema), GovController.respondToPoll)

export default router