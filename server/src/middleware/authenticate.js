import { verifyToken } from '../lib/jwt.js';
import { sendError } from '../lib/apiResponse.js';
import prisma from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) return sendError(res, 'Invalid or expired token', 401);

    // Check user still active
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        studentDetail: {
          select: { department: true, year: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Account not found or deactivated', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      studentDetail: user.studentDetail,
    };

    next();
  } catch (err) {
    return sendError(res, 'Authentication failed', 401);
  }
}