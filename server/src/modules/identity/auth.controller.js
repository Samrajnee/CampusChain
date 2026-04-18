import * as AuthService from './auth.service.js'
import { sendSuccess, sendError } from '../../lib/apiResponse.js'

export const register = async (req, res, next) => {
  try {
    const result = await AuthService.registerUser(req.body)
    return sendSuccess(res, result, 'Account created successfully', 201)
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const result = await AuthService.loginUser({
      ...req.body,
      ipAddress: req.ip,
    })
    return sendSuccess(res, result, 'Logged in successfully')
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const googleCallback = async (req, res) => {
  try {
    const { token } = await AuthService.findOrCreateGoogleUser(req.user)
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`)
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/auth/google/error`)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.user.id)
    return sendSuccess(res, { user })
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    await AuthService.forgotPassword(req.body.email)
    return sendSuccess(res, {}, 'If that email exists, a reset link has been sent')
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    await AuthService.resetPassword(req.body)
    return sendSuccess(res, {}, 'Password reset successfully')
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const logout = (req, res) => {
  // JWT is stateless — client drops the token
  // For future: add token to a Redis denylist here
  return sendSuccess(res, {}, 'Logged out successfully')
}