import { Router } from 'express'
import * as IdentityController from './identity.controller.js'
import authenticate from '../../middleware/authenticate.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import {
  issueCertificateSchema,
  revokeCertificateSchema,
  awardBadgeSchema,
  updateProfileSchema,
  createBadgeSchema,
} from './identity.validation.js'

const router = Router()

// Public — no auth needed
router.get('/verify/:code', IdentityController.verifyCertificate)
router.get('/portfolio/:slug', IdentityController.getPublicProfile)

router.use(authenticate)

// Certificates
router.get('/certificates', IdentityController.listCertificates)
router.get('/certificates/user/:userId', IdentityController.listCertificates)
router.post('/certificates', authorize('TEACHER'), validate(issueCertificateSchema), IdentityController.issueCertificate)
router.patch('/certificates/:id/revoke', authorize('HOD'), validate(revokeCertificateSchema), IdentityController.revokeCertificate)

// Badges
router.get('/badges', IdentityController.listBadges)
router.get('/badges/user/:userId', IdentityController.getUserBadges)
router.get('/badges/me', IdentityController.getUserBadges)
router.post('/badges', authorize('PRINCIPAL'), validate(createBadgeSchema), IdentityController.createBadge)
router.post('/badges/award', authorize('TEACHER'), validate(awardBadgeSchema), IdentityController.awardBadge)

// Profile
router.put('/profile', validate(updateProfileSchema), IdentityController.updateProfile)
router.get('/xp/timeline', IdentityController.getXPTimeline)

// Leaderboard & Directory
router.get('/leaderboard', IdentityController.getLeaderboard)
router.get('/directory', IdentityController.getDirectory)

export default router