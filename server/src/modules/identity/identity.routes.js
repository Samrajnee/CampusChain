import { Router } from 'express'
import * as IdentityController from './identity.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import {
  issueCertificateSchema,
  revokeCertificateSchema,
  awardBadgeSchema,
  updateProfileSchema,
  createBadgeSchema,
} from './identity.validation.js'
import * as skillsController from './skills.controller.js';

const router = Router()

// Skills — own profile
router.get('/skills/me',              authenticate, skillsController.getMySkills);
router.post('/skills',                authenticate, skillsController.addSkill);
router.delete('/skills/:skillId',     authenticate, skillsController.removeSkill);

// Skills — other users
router.get('/skills/user/:userId',    authenticate, skillsController.getUserSkills);
router.get('/skills/search',          authenticate, skillsController.searchSkills);

// Endorsements
router.post('/skills/endorse/:userId',    authenticate, skillsController.endorseSkill);
router.delete('/skills/endorse/:userId/:skillId', authenticate, skillsController.removeEndorsement);


// Public — no auth needed
router.get('/verify/:code', IdentityController.verifyCertificate)
router.get('/portfolio/:slug', IdentityController.getPortfolio)

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