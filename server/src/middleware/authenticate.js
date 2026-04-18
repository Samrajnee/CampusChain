import { verifyToken } from '../lib/jwt.js'
import { sendError } from '../lib/apiResponse.js'
import prisma from '../lib/prisma.js'

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return sendError(res, 'Account not found or deactivated', 401)
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Session expired, please log in again', 401)
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401)
    return sendError(res, 'Authentication failed', 401)
  }
}

export default authenticate