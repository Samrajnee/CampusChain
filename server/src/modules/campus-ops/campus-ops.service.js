import prisma from '../../lib/prisma.js'
import { writeAuditLog } from '../../lib/audit.js'
import crypto from 'crypto'

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────

export const createEvent = async ({ title, description, venue, startsAt, endsAt, maxCapacity, clubId, createdById }) => {
  const qrCode = crypto.randomBytes(16).toString('hex')

  const event = await prisma.event.create({
    data: {
      title,
      description,
      venue,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      maxCapacity: maxCapacity ?? null,
      clubId: clubId ?? null,
      createdById,
      qrCode,
      status: 'UPCOMING',
    },
    include: { createdBy: { include: { profile: true } }, club: true },
  })

  await writeAuditLog({
    actorId: createdById,
    action: 'EVENT_CREATED',
    targetId: event.id,
    targetType: 'Event',
    metadata: { title },
  })

  return event
}

export const listEvents = async () => {
  return prisma.event.findMany({
    where: { deletedAt: null },
    include: {
      createdBy: { include: { profile: true } },
      club: true,
      _count: { select: { rsvps: true, attendance: true } },
    },
    orderBy: { startsAt: 'asc' },
  })
}

export const getEvent = async (id, userId) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: {
      createdBy: { include: { profile: true } },
      club: true,
      committee: { include: { user: { include: { profile: true } } } },
      rsvps: { include: { user: { include: { profile: true } } } },
      _count: { select: { rsvps: true, attendance: true } },
    },
  })
  if (!event) throw { status: 404, message: 'Event not found' }

  const hasRsvp = event.rsvps.some((r) => r.userId === userId)
  const hasAttended = await prisma.attendance.findFirst({
    where: { eventId: id, studentId: userId },
  })

  return { ...event, hasRsvp, hasAttended: !!hasAttended }
}

export const rsvpEvent = async ({ eventId, userId }) => {
  const event = await prisma.event.findFirst({ where: { id: eventId, deletedAt: null } })
  if (!event) throw { status: 404, message: 'Event not found' }
  if (event.status === 'CANCELLED') throw { status: 400, message: 'This event has been cancelled' }
  if (event.status === 'COMPLETED') throw { status: 400, message: 'This event has already ended' }

  const existing = await prisma.eventRSVP.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })

  if (existing) {
    await prisma.eventRSVP.delete({ where: { id: existing.id } })
    return { action: 'removed', message: 'RSVP cancelled' }
  }

  if (event.maxCapacity) {
    const count = await prisma.eventRSVP.count({ where: { eventId } })
    if (count >= event.maxCapacity) throw { status: 400, message: 'This event is at full capacity' }
  }

  await prisma.eventRSVP.create({ data: { eventId, userId } })
  return { action: 'added', message: 'RSVP confirmed' }
}

export const markAttendance = async ({ eventId, studentId, markedById, method = 'MANUAL' }) => {
  const event = await prisma.event.findFirst({ where: { id: eventId, deletedAt: null } })
  if (!event) throw { status: 404, message: 'Event not found' }

  const existing = await prisma.attendance.findUnique({
    where: { eventId_studentId: { eventId, studentId } },
  })
  if (existing) throw { status: 409, message: 'Attendance already marked for this student' }

  const attendance = await prisma.$transaction(async (tx) => {
    const a = await tx.attendance.create({
      data: { eventId, studentId, markedById, method },
    })

    await tx.xPLedger.create({
      data: {
        userId: studentId,
        amount: 20,
        eventType: 'EVENT_ATTENDED',
        description: `Attended event: ${event.title}`,
        refId: eventId,
      },
    })

    await tx.studentDetail.updateMany({
      where: { userId: studentId },
      data: { xpTotal: { increment: 20 } },
    })

    return a
  })

  await writeAuditLog({
    actorId: markedById,
    action: 'ATTENDANCE_MARKED',
    targetId: eventId,
    targetType: 'Event',
    metadata: { studentId, method },
  })

  return attendance
}

export const checkInByQr = async ({ qrCode, userId, markedById }) => {
  const event = await prisma.event.findFirst({
    where: { qrCode, deletedAt: null },
  })
  if (!event) throw { status: 404, message: 'Invalid QR code' }
  if (event.status === 'CANCELLED') throw { status: 400, message: 'This event has been cancelled' }

  return markAttendance({ eventId: event.id, studentId: userId, markedById, method: 'QR' })
}

export const updateEventStatus = async ({ id, status, actorId }) => {
  const event = await prisma.event.findFirst({ where: { id, deletedAt: null } })
  if (!event) throw { status: 404, message: 'Event not found' }

  const updated = await prisma.event.update({ where: { id }, data: { status } })

  await writeAuditLog({
    actorId,
    action: 'EVENT_STATUS_CHANGED',
    targetId: id,
    targetType: 'Event',
    metadata: { from: event.status, to: status },
  })

  return updated
}

export const deleteEvent = async (id, actorId) => {
  const event = await prisma.event.findFirst({ where: { id, deletedAt: null } })
  if (!event) throw { status: 404, message: 'Event not found' }

  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } })

  await writeAuditLog({
    actorId,
    action: 'EVENT_DELETED',
    targetId: id,
    targetType: 'Event',
  })
}

// ─────────────────────────────────────────────
// CLUBS
// ─────────────────────────────────────────────

export const createClub = async ({ name, description, createdById }) => {
  const existing = await prisma.club.findUnique({ where: { name } })
  if (existing) throw { status: 409, message: 'A club with this name already exists' }

  const club = await prisma.$transaction(async (tx) => {
    const c = await tx.club.create({
      data: { name, description, status: 'PENDING_APPROVAL' },
    })

    await tx.clubMember.create({
      data: { clubId: c.id, userId: createdById, role: 'PRESIDENT' },
    })

    return c
  })

  await writeAuditLog({
    actorId: createdById,
    action: 'CLUB_CREATED',
    targetId: club.id,
    targetType: 'Club',
    metadata: { name },
  })

  return club
}

export const listClubs = async () => {
  return prisma.club.findMany({
    where: { deletedAt: null },
    include: {
      advisor: { include: { user: { include: { profile: true } } } },
      _count: { select: { members: true, events: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export const getClub = async (id, userId) => {
  const club = await prisma.club.findFirst({
    where: { id, deletedAt: null },
    include: {
      advisor: { include: { user: { include: { profile: true } } } },
      members: {
        include: { user: { include: { profile: true, studentDetail: true } } },
        orderBy: { role: 'asc' },
      },
      events: {
        where: { deletedAt: null },
        orderBy: { startsAt: 'desc' },
        take: 5,
      },
      budgets: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  if (!club) throw { status: 404, message: 'Club not found' }

  const membership = club.members.find((m) => m.userId === userId)
  return { ...club, userRole: membership?.role ?? null, isMember: !!membership }
}

export const joinClub = async ({ clubId, userId }) => {
  const club = await prisma.club.findFirst({ where: { id: clubId, deletedAt: null } })
  if (!club) throw { status: 404, message: 'Club not found' }
  if (club.status !== 'ACTIVE') throw { status: 400, message: 'This club is not currently accepting members' }

  const existing = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
  })
  if (existing) throw { status: 409, message: 'You are already a member of this club' }

  const member = await prisma.$transaction(async (tx) => {
    const m = await tx.clubMember.create({
      data: { clubId, userId, role: 'MEMBER' },
    })

    await tx.xPLedger.create({
      data: {
        userId,
        amount: 10,
        eventType: 'CLUB_JOINED',
        description: `Joined club: ${club.name}`,
        refId: clubId,
      },
    })

    await tx.studentDetail.updateMany({
      where: { userId },
      data: { xpTotal: { increment: 10 } },
    })

    return m
  })

  return member
}

export const leaveClub = async ({ clubId, userId }) => {
  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
  })
  if (!member) throw { status: 404, message: 'You are not a member of this club' }
  if (member.role === 'PRESIDENT') throw { status: 400, message: 'Transfer presidency before leaving the club' }

  await prisma.clubMember.delete({ where: { id: member.id } })
}

export const updateClubStatus = async ({ id, status, advisorId, actorId }) => {
  const club = await prisma.club.findFirst({ where: { id, deletedAt: null } })
  if (!club) throw { status: 404, message: 'Club not found' }

  const updated = await prisma.club.update({
    where: { id },
    data: {
      status,
      ...(advisorId && { advisorId }),
    },
  })

  await writeAuditLog({
    actorId,
    action: 'CLUB_STATUS_CHANGED',
    targetId: id,
    targetType: 'Club',
    metadata: { from: club.status, to: status },
  })

  return updated
}

// ─────────────────────────────────────────────
// BUDGET REQUESTS
// ─────────────────────────────────────────────

export const createBudgetRequest = async ({ clubId, requestedBy, title, description, amount }) => {
  const membership = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: requestedBy } },
  })
  if (!membership || !['PRESIDENT', 'SECRETARY'].includes(membership.role)) {
    throw { status: 403, message: 'Only club presidents or secretaries can submit budget requests' }
  }

  return prisma.budgetRequest.create({
    data: { clubId, requestedBy, title, description, amount },
    include: { club: true, requester: { include: { profile: true } } },
  })
}

export const listBudgetRequests = async ({ clubId, role }) => {
  const isAdmin = ['HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role)

  return prisma.budgetRequest.findMany({
    where: { ...(clubId && { clubId }), ...(!isAdmin && { clubId }) },
    include: {
      club: true,
      requester: { include: { profile: true } },
      approver: { include: { profile: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const updateBudgetStatus = async ({ id, status, adminNote, actorId }) => {
  const budget = await prisma.budgetRequest.findUnique({ where: { id } })
  if (!budget) throw { status: 404, message: 'Budget request not found' }

  return prisma.budgetRequest.update({
    where: { id },
    data: {
      status,
      adminNote,
      approvedBy: actorId,
      approvedAt: new Date(),
    },
  })
}