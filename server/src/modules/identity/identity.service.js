import { notify } from '../notifications/notifications.service.js';
import { creditXP } from '../../lib/xp.js';
import prisma from '../../lib/prisma.js'
import { writeAuditLog } from '../../lib/audit.js'
import crypto from 'crypto'
import QRCode from 'qrcode'
import { sendEmail } from '../../lib/mailer.js';
import { certificateIssuedEmail, badgeEarnedEmail } from '../../lib/emails/templates.js';

// ─────────────────────────────────────────────
// CERTIFICATES
// ─────────────────────────────────────────────

const generateSignature = (data) => {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(JSON.stringify(data))
    .digest('hex')
}

export const issueCertificate = async ({ userId, title, description, type, issuedBy, eventId, actorId }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })
  if (!user) throw { status: 404, message: 'Student not found' }

  const uniqueCode = crypto.randomUUID()

  const signatureData = { userId, title, type, issuedBy, uniqueCode }
  const signature = generateSignature(signatureData)

  const verifyUrl = `${process.env.CLIENT_URL}/verify/${uniqueCode}`
  const qrCodeUrl = await QRCode.toDataURL(verifyUrl)

  const certificate = await prisma.$transaction(async (tx) => {
    const cert = await tx.certificate.create({
      data: {
        userId,
        title,
        description,
        type: type ?? 'PARTICIPATION',
        issuedBy,
        uniqueCode,
        signature,
        qrCodeUrl,
        eventId: eventId ?? null,
      },
      include: { user: { include: { profile: true } } },
    })

    // Fetch user email for notification
const recipient = await prisma.user.findUnique({
  where: { id: data.userId },
  select: { email: true, profile: { select: { firstName: true } } },
});
if (recipient) {
  sendEmail({
    to: recipient.email,
    subject: `Certificate issued: ${data.title}`,
    html: certificateIssuedEmail({
      firstName: recipient.profile?.firstName ?? 'there',
      title: certificate.title,
      issuedBy: certificate.issuedBy,
      type: certificate.type,
      uniqueCode: certificate.uniqueCode,
    }),
  });
}

    await creditXP({
      userId,
      amount: 50,
      eventType: 'CERTIFICATE_ISSUED',
      description: `Certificate issued: ${title}`,
      refId: cert.id,
      tx,
    })

    return cert
  })

  await notify({
    userId,
    type: 'CERTIFICATE_ISSUED',
    title: 'Certificate issued',
    body: `You have received a certificate: "${title}".`,
    refId: certificate.id,
  })

  await writeAuditLog({
    actorId,
    action: 'CERTIFICATE_ISSUED',
    targetId: certificate.id,
    targetType: 'Certificate',
    metadata: { userId, title, type },
  })

  return certificate
}

export const listCertificates = async (userId) => {
  return prisma.certificate.findMany({
    where: { userId, deletedAt: null, isRevoked: false },
    orderBy: { issuedAt: 'desc' },
  })
}

export const verifyCertificate = async (uniqueCode) => {
  const cert = await prisma.certificate.findUnique({
    where: { uniqueCode },
    include: { user: { include: { profile: true, studentDetail: true } } },
  })

  if (!cert) throw { status: 404, message: 'Certificate not found' }
  if (cert.isRevoked) throw { status: 400, message: 'This certificate has been revoked' }

  const signatureData = {
    userId: cert.userId,
    title: cert.title,
    type: cert.type,
    issuedBy: cert.issuedBy,
    uniqueCode: cert.uniqueCode,
  }
  const expectedSignature = generateSignature(signatureData)
  const isValid = expectedSignature === cert.signature

  return { certificate: cert, isValid }
}

export const revokeCertificate = async ({ id, reason, actorId }) => {
  const cert = await prisma.certificate.findUnique({ where: { id } })
  if (!cert) throw { status: 404, message: 'Certificate not found' }
  if (cert.isRevoked) throw { status: 400, message: 'Certificate is already revoked' }

  const updated = await prisma.certificate.update({
    where: { id },
    data: { isRevoked: true, revokedAt: new Date(), revokedReason: reason },
  })

  await writeAuditLog({
    actorId,
    action: 'CERTIFICATE_REVOKED',
    targetId: id,
    targetType: 'Certificate',
    metadata: { reason },
  })

  return updated
}

// ─────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────

export const listBadges = async () => {
  return prisma.badge.findMany({ orderBy: { category: 'asc' } })
}

export const awardBadge = async ({ userId, badgeId, awardedBy }) => {
  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  })
  if (existing) throw { status: 409, message: 'Student already has this badge' }

  const badge = await prisma.badge.findUnique({ where: { id: badgeId } })
  if (!badge) throw { status: 404, message: 'Badge not found' }

  const userBadge = await prisma.$transaction(async (tx) => {
    const ub = await tx.userBadge.create({
      data: { userId, badgeId, awardedBy },
      include: { badge: true },
    })

    if (badge.xpReward > 0) {
      await creditXP({
        userId,
        amount: badge.xpReward,
        eventType: 'BADGE_EARNED',
        description: `Badge earned: ${badge.name}`,
        refId: badgeId,
        tx,
      })
    }

    return ub
  })

  const recipient = await prisma.user.findUnique({
  where: { id: data.userId },
  select: { email: true, profile: { select: { firstName: true } } },
});
if (recipient) {
  sendEmail({
    to: recipient.email,
    subject: `You earned the "${badge.name}" badge`,
    html: badgeEarnedEmail({
      firstName: recipient.profile?.firstName ?? 'there',
      badgeName: badge.name,
      badgeCategory: badge.category,
      xpReward: badge.xpReward,
    }),
  });
}

  await notify({
    userId,
    type: 'BADGE_EARNED',
    title: 'Badge earned',
    body: `You earned the "${badge.name}" badge.`,
    refId: badge.id,
  })

  await writeAuditLog({
    actorId: awardedBy,
    action: 'BADGE_AWARDED',
    targetId: userId,
    targetType: 'User',
    metadata: { badgeId, badgeName: badge.name },
  })

  return userBadge
}

export const getUserBadges = async (userId) => {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  })
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export const getPublicProfile = async (slug) => {
  const profile = await prisma.profile.findUnique({
    where: { portfolioSlug: slug },
    include: {
      user: {
        include: {
          studentDetail: true,
          certificates: {
            where: { deletedAt: null, isRevoked: false },
            orderBy: { issuedAt: 'desc' },
          },
          badgesEarned: {
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
          },
          clubMemberships: {
            include: { club: true },
          },
        },
      },
    },
  })

  if (!profile) throw { status: 404, message: 'Profile not found' }
  if (!profile.isProfilePublic) throw { status: 403, message: 'This profile is private' }

  return profile
}

export const updateProfile = async ({ userId, data }) => {
  const { firstName, lastName, bio, phone, dateOfBirth, gender,
    showAddress, showPhone, showCgpa, showBloodGroup, showDob,
    isProfilePublic, portfolioSlug,
    department, year, semester, section, cgpa, bloodGroup, address, hostelName,
  } = data

  if (portfolioSlug) {
    const existing = await prisma.profile.findUnique({ where: { portfolioSlug } })
    if (existing && existing.userId !== userId) {
      throw { status: 409, message: 'This portfolio URL is already taken' }
    }
  }

  const [profile] = await prisma.$transaction([
    prisma.profile.update({
      where: { userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(gender !== undefined && { gender }),
        ...(showAddress !== undefined && { showAddress }),
        ...(showPhone !== undefined && { showPhone }),
        ...(showCgpa !== undefined && { showCgpa }),
        ...(showBloodGroup !== undefined && { showBloodGroup }),
        ...(showDob !== undefined && { showDob }),
        ...(isProfilePublic !== undefined && { isProfilePublic }),
        ...(portfolioSlug !== undefined && { portfolioSlug }),
      },
    }),
    prisma.studentDetail.updateMany({
      where: { userId },
      data: {
        ...(department && { department }),
        ...(year && { year: Number(year) }),
        ...(semester && { semester: Number(semester) }),
        ...(section !== undefined && { section }),
        ...(cgpa !== undefined && { cgpa: cgpa ? Number(cgpa) : null }),
        ...(bloodGroup !== undefined && { bloodGroup }),
        ...(address !== undefined && { address }),
        ...(hostelName !== undefined && { hostelName }),
      },
    }),
  ])

  return profile
}

export const getXPTimeline = async (userId) => {
  return prisma.xPLedger.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────

export const getLeaderboard = async ({ department, year }) => {
  const students = await prisma.studentDetail.findMany({
    where: {
      ...(department && { department }),
      ...(year && { year: Number(year) }),
    },
    include: {
      user: {
        include: {
          profile: true,
          badgesEarned: { include: { badge: true } },
        },
      },
    },
    orderBy: { xpTotal: 'desc' },
    take: 50,
  })

  return students.map((s, index) => ({
    rank: index + 1,
    userId: s.userId,
    name: `${s.user.profile?.firstName} ${s.user.profile?.lastName}`,
    department: s.department,
    year: s.year,
    xpTotal: s.xpTotal,
    level: s.level,
    badgeCount: s.user.badgesEarned.length,
  }))
}

// ─────────────────────────────────────────────
// DIRECTORY
// ─────────────────────────────────────────────

export const getDirectory = async ({ department, year, search }) => {
  const students = await prisma.studentDetail.findMany({
    where: {
      ...(department && { department }),
      ...(year && { year: Number(year) }),
      ...(search && {
        user: {
          profile: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      }),
    },
    include: {
      user: {
        include: {
          profile: true,
          badgesEarned: { include: { badge: true }, take: 3 },
        },
      },
    },
    take: 50,
    orderBy: { user: { profile: { firstName: 'asc' } } },
  })

  return students
    .filter((s) => s.user.profile?.isProfilePublic)
    .map((s) => ({
      userId: s.userId,
      name: `${s.user.profile?.firstName} ${s.user.profile?.lastName}`,
      department: s.department,
      year: s.year,
      level: s.level,
      xpTotal: s.xpTotal,
      badges: s.user.badgesEarned.map((b) => b.badge),
      portfolioSlug: s.user.profile?.portfolioSlug,
    }))
}