import prisma from '../../lib/prisma.js';
import { creditXP } from '../../lib/xp.js';
import { notify } from '../notifications/notifications.service.js';
import { writeAuditLog } from '../../lib/audit.js';

// ── Create a mentorship request (student) ─────────────────────────────────────

export async function createRequest({ menteeId, topic, description }) {
  // One active/pending request per student at a time
  const existing = await prisma.mentorship.findFirst({
    where: {
      menteeId,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (existing) {
    throw Object.assign(
      new Error('You already have an active or pending mentorship request.'),
      { status: 409 }
    );
  }

  const mentorship = await prisma.mentorship.create({
    data: {
      menteeId,
      topic,
      description,
      status: 'PENDING',
    },
    include: {
      mentee: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true } },
          studentDetail: { select: { department: true, year: true } },
        },
      },
    },
  });

  return mentorship;
}

// ── List mentorships ──────────────────────────────────────────────────────────
// Students see their own. Teachers see all PENDING + their accepted ones.

export async function listMentorships({ userId, role, status, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const isAdmin = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role);

  const where = {
    ...(status ? { status } : {}),
    ...(!isAdmin
      ? {
          OR: [{ menteeId: userId }, { mentorId: userId }],
        }
      : {}),
  };

  const [mentorships, total] = await Promise.all([
    prisma.mentorship.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        mentee: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true } },
            studentDetail: { select: { department: true, year: true } },
          },
        },
        mentor: {
          select: {
            id: true,
            role: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.mentorship.count({ where }),
  ]);

  return {
    mentorships,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Get single mentorship ─────────────────────────────────────────────────────

export async function getMentorship({ id, userId, role }) {
  const isAdmin = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role);

  const mentorship = await prisma.mentorship.findUnique({
    where: { id },
    include: {
      mentee: {
        select: {
          id: true,
          email: true,
          profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          studentDetail: { select: { department: true, year: true, xpTotal: true } },
        },
      },
      mentor: {
        select: {
          id: true,
          role: true,
          email: true,
          profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!mentorship) {
    throw Object.assign(new Error('Mentorship not found'), { status: 404 });
  }

  // Students can only see their own
  if (!isAdmin && mentorship.menteeId !== userId && mentorship.mentorId !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  return mentorship;
}

// ── Accept a pending request (mentor) ────────────────────────────────────────

export async function acceptRequest({ id, mentorId, ipAddress }) {
  const mentorship = await prisma.mentorship.findUnique({ where: { id } });

  if (!mentorship) {
    throw Object.assign(new Error('Mentorship not found'), { status: 404 });
  }
  if (mentorship.status !== 'PENDING') {
    throw Object.assign(new Error('This request is no longer pending'), { status: 409 });
  }
  if (mentorship.menteeId === mentorId) {
    throw Object.assign(new Error('You cannot mentor yourself'), { status: 400 });
  }

  const updated = await prisma.mentorship.update({
    where: { id },
    data: {
      mentorId,
      status: 'ACTIVE',
      acceptedAt: new Date(),
    },
    include: {
      mentee: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
      mentor: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  // Notify the mentee
  await notify({
    userId: mentorship.menteeId,
    type: 'CUSTOM',
    title: 'Mentorship request accepted',
    body: `${updated.mentor.profile?.firstName ?? 'Someone'} ${updated.mentor.profile?.lastName ?? ''} has accepted your mentorship request on "${mentorship.topic}".`,
    refId: id,
  });

  await writeAuditLog({
    actorId: mentorId,
    action: 'MENTORSHIP_ACCEPTED',
    targetId: id,
    targetType: 'Mentorship',
    metadata: { topic: mentorship.topic, menteeId: mentorship.menteeId },
    ipAddress,
  });

  return updated;
}

// ── Complete a mentorship ─────────────────────────────────────────────────────

export async function completeMentorship({ id, actorId, role, ipAddress }) {
  const mentorship = await prisma.mentorship.findUnique({ where: { id } });

  if (!mentorship) {
    throw Object.assign(new Error('Mentorship not found'), { status: 404 });
  }
  if (mentorship.status !== 'ACTIVE') {
    throw Object.assign(new Error('Only active mentorships can be completed'), { status: 409 });
  }

  const isAdmin = ['HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role);
  const isParticipant = mentorship.mentorId === actorId || mentorship.menteeId === actorId;

  if (!isParticipant && !isAdmin) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  await prisma.mentorship.update({
    where: { id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Award XP to mentee
  await creditXP({
    userId: mentorship.menteeId,
    amount: 30,
    eventType: 'MENTORSHIP_COMPLETED',
    description: `Completed mentorship: ${mentorship.topic}`,
    refId: id,
  });

  // Award XP to mentor
  await creditXP({
    userId: mentorship.mentorId,
    amount: 20,
    eventType: 'CUSTOM',
    description: `Mentored student on: ${mentorship.topic}`,
    refId: id,
  });

  // Notify both parties
  await Promise.all([
    notify({
      userId: mentorship.menteeId,
      type: 'CUSTOM',
      title: 'Mentorship completed',
      body: `Your mentorship on "${mentorship.topic}" is complete. You earned 30 XP.`,
      refId: id,
    }),
    notify({
      userId: mentorship.mentorId,
      type: 'CUSTOM',
      title: 'Mentorship completed',
      body: `Mentorship on "${mentorship.topic}" marked complete. You earned 20 XP.`,
      refId: id,
    }),
  ]);

  await writeAuditLog({
    actorId,
    action: 'MENTORSHIP_COMPLETED',
    targetId: id,
    targetType: 'Mentorship',
    metadata: { topic: mentorship.topic },
    ipAddress,
  });
}

// ── Cancel a pending request (mentee only) ───────────────────────────────────

export async function cancelRequest({ id, actorId, role, ipAddress }) {
  const mentorship = await prisma.mentorship.findUnique({ where: { id } });

  if (!mentorship) {
    throw Object.assign(new Error('Mentorship not found'), { status: 404 });
  }

  const isAdmin = ['HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role);
  const isMentee = mentorship.menteeId === actorId;

  if (!isMentee && !isAdmin) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  if (!['PENDING', 'ACTIVE'].includes(mentorship.status)) {
    throw Object.assign(
      new Error('Only pending or active mentorships can be cancelled'),
      { status: 409 }
    );
  }

  await prisma.mentorship.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  // If there was a mentor, notify them
  if (mentorship.mentorId) {
    await notify({
      userId: mentorship.mentorId,
      type: 'CUSTOM',
      title: 'Mentorship cancelled',
      body: `The mentorship request on "${mentorship.topic}" has been cancelled.`,
      refId: id,
    });
  }

  await writeAuditLog({
    actorId,
    action: 'MENTORSHIP_CANCELLED',
    targetId: id,
    targetType: 'Mentorship',
    metadata: { topic: mentorship.topic },
    ipAddress,
  });
}

// ── Admin close ───────────────────────────────────────────────────────────────

export async function closeMentorship({ id, actorId, ipAddress }) {
  const mentorship = await prisma.mentorship.findUnique({ where: { id } });
  if (!mentorship) throw Object.assign(new Error('Mentorship not found'), { status: 404 });

  await prisma.mentorship.update({
    where: { id },
    data: { status: 'CLOSED' },
  });

  await writeAuditLog({
    actorId,
    action: 'MENTORSHIP_CLOSED',
    targetId: id,
    targetType: 'Mentorship',
    metadata: { topic: mentorship.topic },
    ipAddress,
  });
}