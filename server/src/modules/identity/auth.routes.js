import { Router } from 'express'
import passport from '../../lib/passport.js'
import * as AuthController from './auth.controller.js'
import authenticate from '../../middleware/authenticate.js'
import validate from '../../middleware/validate.js'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation.js'

const router = Router()

const googleAuthGuard = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ success: false, message: 'Google OAuth is not configured yet' })
  }
  next()
}

// Email / password
router.post('/register', validate(registerSchema), AuthController.register)
router.post('/login', validate(loginSchema), AuthController.login)
router.post('/logout', authenticate, AuthController.logout)
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword)

// Current user
router.get('/me', authenticate, AuthController.getMe)

// Google OAuth — guarded until credentials are set
router.get('/google', googleAuthGuard, passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback', googleAuthGuard, passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/error' }), AuthController.googleCallback)
router.get('/google/error', (req, res) => res.status(401).json({ success: false, message: 'Google authentication failed' }))

export default router