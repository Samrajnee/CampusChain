import prisma from '../../lib/prisma.js'
import { hashPassword, comparePassword } from '../../lib/hash.js'
import { signToken } from '../../lib/jwt.js'
import { writeAuditLog } from '../../lib/audit.js'
import crypto from 'crypto'
import { sendEmail } from '../../lib/mailer.js';
import { welcomeEmail, passwordResetEmail } from '../../lib/emails/templates.js';

// ── Helpers ──────────────────────────────────────────────

const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
})

const sanitizeUser = (user) => {
  const { passwordHash, emailVerifyToken, passwordResetToken, passwordResetExpiry, ...safe } = user
  return safe
}

// ── Register ─────────────────────────────────────────────

export const registerUser = async ({ email, password, firstName, lastName, role = 'STUDENT', studentId, department, year, semester, employeeId, designation }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw { status: 409, message: 'An account with this email already exists' }

  const passwordHash = await hashPassword(password)
  const emailVerifyToken = crypto.randomBytes(32).toString('hex')

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        role,
        emailVerifyToken,
        profile: {
          create: { firstName, lastName },
        },
      },
      include: { profile: true },
    })

    if (role === 'STUDENT' || !role) {
      await tx.studentDetail.create({
        data: {
          userId: newUser.id,
          studentId: studentId || `STU-${Date.now()}`,
          department: department || 'General',
          year: year || 1,
          semester: semester || 1,
        },
      })
    } else {
      await tx.facultyDetail.create({
        data: {
          userId: newUser.id,
          employeeId: employeeId || `FAC-${Date.now()}`,
          department: department || 'General',
          designation: designation || role,
        },
      })
    }

    // Send welcome email — fire and forget
sendEmail({
  to: user.email,
  subject: 'Welcome to CampusChain',
  html: welcomeEmail({
    firstName: data.firstName ?? 'there',
    email: user.email,
  }),
});

    return newUser
  })

  const token = signToken(buildTokenPayload(user))

  await writeAuditLog({
    actorId: user.id,
    action: 'USER_REGISTERED',
    targetId: user.id,
    targetType: 'User',
    metadata: { email, role },
  })

  return { token, user: sanitizeUser(user) }
}

// ── Login ─────────────────────────────────────────────────

export const loginUser = async ({ email, password, ipAddress }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, studentDetail: true, facultyDetail: true },
  })

  if (!user || !user.passwordHash) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  if (!user.isActive) {
    throw { status: 403, message: 'Your account has been deactivated. Contact the administrator.' }
  }

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) throw { status: 401, message: 'Invalid email or password' }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const token = signToken(buildTokenPayload(user))

  await writeAuditLog({
    actorId: user.id,
    action: 'USER_LOGIN',
    targetId: user.id,
    targetType: 'User',
    ipAddress,
  })

  return { token, user: sanitizeUser(user) }
}

// ── Google OAuth ──────────────────────────────────────────

export const findOrCreateGoogleUser = async ({ googleId, email, firstName, lastName, avatarUrl }) => {
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
    include: { profile: true, studentDetail: true },
  })

  if (user) {
    if (!user.googleId) {
      await prisma.user.update({ where: { id: user.id }, data: { googleId, isEmailVerified: true } })
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  } else {
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          googleId,
          isEmailVerified: true,
          role: 'STUDENT',
          profile: {
            create: { firstName, lastName, avatarUrl },
          },
        },
        include: { profile: true },
      })
      await tx.studentDetail.create({
        data: {
          userId: newUser.id,
          studentId: `STU-${Date.now()}`,
          department: 'General',
          year: 1,
          semester: 1,
        },
      })
      return newUser
    })
  }

  const token = signToken(buildTokenPayload(user))
  return { token, user: sanitizeUser(user) }
}

// ── Get current user ──────────────────────────────────────

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      studentDetail: true,
      facultyDetail: true,
    },
  })
  if (!user) throw { status: 404, message: 'User not found' }
  return sanitizeUser(user)
}

// ── Forgot / Reset password ───────────────────────────────

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } })
  // Always return success even if email not found (prevent enumeration)
  if (!user) return

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  })

  // TODO: send email with reset link — wire up after email service is configured
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
sendEmail({
  to: user.email,
  subject: 'Reset your CampusChain password',
  html: passwordResetEmail({
    firstName: user.profile?.firstName ?? 'there',
    resetUrl,
  }),

});

}

export const resetPassword = async ({ token, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  })
  if (!user) throw { status: 400, message: 'Invalid or expired reset token' }

  const passwordHash = await hashPassword(password)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  })

  await writeAuditLog({
    actorId: user.id,
    action: 'PASSWORD_RESET',
    targetId: user.id,
    targetType: 'User',
  })
}