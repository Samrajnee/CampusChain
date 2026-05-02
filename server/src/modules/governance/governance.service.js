import { notify } from '../notifications/notifications.service.js';
import { creditXP } from '../../lib/xp.js';
import prisma from '../../lib/prisma.js'
import { writeAuditLog } from '../../lib/audit.js'
import { sendEmail } from '../../lib/mailer.js';
import { grievanceUpdateEmail } from '../../lib/emails/templates.js';

// ─────────────────────────────────────────────
// PROPOSALS
// ─────────────────────────────────────────────

export const createProposal = async ({ authorId, title, body, isAnonymous }) => {
  const proposal = await prisma.proposal.create({
    data: { authorId, title, body, isAnonymous: isAnonymous ?? false },
    include: { author: { include: { profile: true } } },
  })

  await creditXP({
    userId: authorId,
    amount: 15,
    eventType: 'PROPOSAL_SUBMITTED',
    description: `Submitted proposal: ${title}`,
    refId: proposal.id,
  })

  await writeAuditLog({
    actorId: authorId,
    action: 'PROPOSAL_CREATED',
    targetId: proposal.id,
    targetType: 'Proposal',
  })

  return proposal
}

export const listProposals = async (userId) => {
  const proposals = await prisma.proposal.findMany({
    where: { deletedAt: null },
    include: {
      author: { include: { profile: true } },
      votes: true,
    },
    orderBy: { upvotes: 'desc' },
  })

  return proposals.map((p) => {
    const userVote = p.votes.find((v) => v.userId === userId)
    return {
      ...p,
      author: p.isAnonymous ? null : p.author,
      userVote: userVote ? (userVote.isUpvote ? 'UP' : 'DOWN') : null,
    }
  })
}

export const getProposal = async (id, userId) => {
  const proposal = await prisma.proposal.findFirst({
    where: { id, deletedAt: null },
    include: {
      author: { include: { profile: true } },
      votes: true,
    },
  })
  if (!proposal) throw { status: 404, message: 'Proposal not found' }

  const userVote = proposal.votes.find((v) => v.userId === userId)
  return {
    ...proposal,
    author: proposal.isAnonymous ? null : proposal.author,
    userVote: userVote ? (userVote.isUpvote ? 'UP' : 'DOWN') : null,
  }
}

export const voteOnProposal = async ({ proposalId, userId, isUpvote }) => {
  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, deletedAt: null },
  })
  if (!proposal) throw { status: 404, message: 'Proposal not found' }
  if (proposal.status !== 'OPEN') throw { status: 400, message: 'Voting is closed for this proposal' }

  const existing = await prisma.proposalVote.findUnique({
    where: { proposalId_userId: { proposalId, userId } },
  })

  if (existing) {
    if (existing.isUpvote === isUpvote) {
      await prisma.$transaction([
        prisma.proposalVote.delete({ where: { id: existing.id } }),
        prisma.proposal.update({
          where: { id: proposalId },
          data: isUpvote
            ? { upvotes: { decrement: 1 } }
            : { downvotes: { decrement: 1 } },
        }),
      ])
      return { action: 'removed' }
    } else {
      await prisma.$transaction([
        prisma.proposalVote.update({ where: { id: existing.id }, data: { isUpvote } }),
        prisma.proposal.update({
          where: { id: proposalId },
          data: isUpvote
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        }),
      ])
      return { action: 'switched' }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.proposalVote.create({ data: { proposalId, userId, isUpvote } })
    await tx.proposal.update({
      where: { id: proposalId },
      data: isUpvote
        ? { upvotes: { increment: 1 } }
        : { downvotes: { increment: 1 } },
    })
    await creditXP({
      userId,
      amount: 5,
      eventType: 'PROPOSAL_UPVOTED',
      description: 'Voted on a proposal',
      refId: proposalId,
      tx,
    })
  })

  return { action: 'added' }
}

export const updateProposalStatus = async ({ id, status, adminNote, actorId }) => {
  const proposal = await prisma.proposal.findFirst({
    where: { id, deletedAt: null },
  })
  if (!proposal) throw { status: 404, message: 'Proposal not found' }

  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ?? proposal.adminNote,
      resolvedBy: actorId,
      resolvedAt: new Date(),
    },
  })

  await notify({
    userId: proposal.authorId,
    type: 'PROPOSAL_STATUS_UPDATED',
    title: 'Proposal status updated',
    body: `Your proposal "${proposal.title}" is now ${status}.`,
    refId: id,
  })

  await writeAuditLog({
    actorId,
    action: 'PROPOSAL_STATUS_CHANGED',
    targetId: id,
    targetType: 'Proposal',
    metadata: { from: proposal.status, to: status },
  })

  return updated
}

export const deleteProposal = async (id, actorId) => {
  const proposal = await prisma.proposal.findFirst({ where: { id, deletedAt: null } })
  if (!proposal) throw { status: 404, message: 'Proposal not found' }
  if (proposal.authorId !== actorId) throw { status: 403, message: 'You can only delete your own proposals' }

  await prisma.proposal.update({ where: { id }, data: { deletedAt: new Date() } })
}

// ─────────────────────────────────────────────
// GRIEVANCES
// ─────────────────────────────────────────────

export const createGrievance = async ({ studentId, title, description, isAnonymous }) => {
  const grievance = await prisma.grievance.create({
    data: { studentId, title, description, isAnonymous: isAnonymous ?? false },
  })

  await writeAuditLog({
    actorId: studentId,
    action: 'GRIEVANCE_SUBMITTED',
    targetId: grievance.id,
    targetType: 'Grievance',
  })

  return grievance
}

export const listGrievances = async ({ userId, role }) => {
  const isAdmin = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role)

  const grievances = await prisma.grievance.findMany({
    where: {
      deletedAt: null,
      ...(!isAdmin && { studentId: userId }),
    },
    include: {
      student: { include: { profile: true } },
      statusHistory: { orderBy: { changedAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return grievances.map((g) => ({
    ...g,
    student: g.isAnonymous && !isAdmin ? null : g.student,
  }))
}

export const getGrievance = async ({ id, userId, role }) => {
  const isAdmin = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN'].includes(role)

  const grievance = await prisma.grievance.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(!isAdmin && { studentId: userId }),
    },
    include: {
      student: { include: { profile: true } },
      statusHistory: { orderBy: { changedAt: 'asc' } },
    },
  })

  if (!grievance) throw { status: 404, message: 'Grievance not found' }
  return grievance
}

export const updateGrievanceStatus = async ({ id, status, note, actorId }) => {
  const grievance = await prisma.grievance.findFirst({
    where: { id, deletedAt: null },
  })
  if (!grievance) throw { status: 404, message: 'Grievance not found' }

  const updated = await prisma.$transaction(async (tx) => {
    const g = await tx.grievance.update({
      where: { id },
      data: {
        status,
        adminNote: note ?? grievance.adminNote,
        assignedTo: actorId,
        ...(status === 'ESCALATED' && { escalatedAt: new Date() }),
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    })

    // Notify student by email if not anonymous
if (!grievance.isAnonymous) {
  const student = await prisma.user.findUnique({
    where: { id: grievance.studentId },
    select: { email: true, profile: { select: { firstName: true } } },
  });
  if (student) {
    sendEmail({
      to: student.email,
      subject: `Grievance update: ${grievance.title}`,
      html: grievanceUpdateEmail({
        firstName: student.profile?.firstName ?? 'there',
        title: grievance.title,
        status,
        adminNote: data.adminNote ?? null,
      }),
    });
  }
}

    await tx.grievanceLog.create({
      data: {
        grievanceId: id,
        fromStatus: grievance.status,
        toStatus: status,
        note,
        changedBy: actorId,
      },
    })

    if (status === 'RESOLVED') {
      await creditXP({
        userId: grievance.studentId,
        amount: 20,
        eventType: 'GRIEVANCE_RESOLVED',
        description: 'Grievance resolved',
        refId: id,
        tx,
      })
    }

    return g
  })

  await notify({
    userId: grievance.studentId,
    type: 'GRIEVANCE_RESOLVED',
    title: 'Grievance update',
    body: `Your grievance "${grievance.title}" is now ${status}.`,
    refId: id,
  })

  await writeAuditLog({
    actorId,
    action: 'GRIEVANCE_STATUS_CHANGED',
    targetId: id,
    targetType: 'Grievance',
    metadata: { from: grievance.status, to: status },
  })

  return updated
}

// ─────────────────────────────────────────────
// POLLS
// ─────────────────────────────────────────────

export const createPoll = async ({ title, description, options, endsAt, createdBy }) => {
  const poll = await prisma.poll.create({
    data: {
      title, description, createdBy,
      endsAt: endsAt ? new Date(endsAt) : null,
      options: { create: options.map((text) => ({ text })) },
    },
    include: { options: true },
  })

  await writeAuditLog({
    actorId: createdBy,
    action: 'POLL_CREATED',
    targetId: poll.id,
    targetType: 'Poll',
  })

  return poll
}

export const listPolls = async (userId) => {
  const polls = await prisma.poll.findMany({
    where: { deletedAt: null },
    include: {
      options: true,
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const enriched = await Promise.all(
    polls.map(async (p) => {
      const userResponse = await prisma.pollResponse.findFirst({
        where: { pollId: p.id, userId },
      })
      return { ...p, totalResponses: p._count.responses, userResponseId: userResponse?.pollOptionId ?? null }
    })
  )

  return enriched
}

export const respondToPoll = async ({ pollId, pollOptionId, userId }) => {
  const poll = await prisma.poll.findFirst({ where: { id: pollId, deletedAt: null } })
  if (!poll) throw { status: 404, message: 'Poll not found' }
  if (!poll.isLive) throw { status: 400, message: 'This poll is no longer active' }
  if (poll.endsAt && new Date() > new Date(poll.endsAt)) {
    throw { status: 400, message: 'This poll has ended' }
  }

  const existing = await prisma.pollResponse.findUnique({
    where: { pollId_userId: { pollId, userId } },
  })
  if (existing) throw { status: 409, message: 'You have already responded to this poll' }

  const option = await prisma.pollOption.findFirst({
    where: { id: pollOptionId, pollId },
  })
  if (!option) throw { status: 404, message: 'Option not found' }

  await prisma.$transaction(async (tx) => {
    await tx.pollResponse.create({ data: { pollId, pollOptionId, userId } })
    await tx.pollOption.update({
      where: { id: pollOptionId },
      data: { voteCount: { increment: 1 } },
    })
    await creditXP({
      userId,
      amount: 5,
      eventType: 'POLL_PARTICIPATED',
      description: `Responded to poll: ${poll.title}`,
      refId: pollId,
      tx,
    })
  })

  return { message: 'Response recorded' }
}