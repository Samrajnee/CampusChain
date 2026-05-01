import { notify } from '../notifications/notifications.service.js';
import { creditXP } from '../../lib/xp.js';
import prisma from '../../lib/prisma.js'
import { writeAuditLog } from '../../lib/audit.js'
import crypto from 'crypto'

// ── Create election ───────────────────────────────────────

export const createElection = async ({ title, description, startsAt, endsAt, isAnonymous, eligibleYear, eligibleDept, createdBy }) => {
  const election = await prisma.election.create({
    data: {
      title, description,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      isAnonymous: isAnonymous ?? false,
      eligibleYear: eligibleYear ?? null,
      eligibleDept: eligibleDept ?? null,
      createdBy,
      status: 'DRAFT',
    },
  })

  await writeAuditLog({
    actorId: createdBy,
    action: 'ELECTION_CREATED',
    targetId: election.id,
    targetType: 'Election',
    metadata: { title },
  })

  return election
}

// ── List elections ────────────────────────────────────────

export const listElections = async ({ userId, role }) => {
  const elections = await prisma.election.findMany({
    where: { deletedAt: null },
    include: {
      candidates: {
        include: {
          user: { include: { profile: true, studentDetail: true } },
        },
      },
      _count: { select: { votes: true, voterTokens: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const enriched = await Promise.all(
    elections.map(async (e) => {
      const hasVoted = await prisma.vote.findFirst({
        where: { electionId: e.id, voterId: userId },
      })
      const voterToken = await prisma.voterToken.findFirst({
        where: { electionId: e.id, userId },
      })
      return {
        ...e,
        hasVoted: !!(hasVoted || voterToken?.hasVoted),
        voterCount: e._count.votes,
      }
    })
  )

  return enriched
}

// ── Get single election ───────────────────────────────────

export const getElection = async (id, userId) => {
  const election = await prisma.election.findFirst({
    where: { id, deletedAt: null },
    include: {
      candidates: {
        include: {
          user: { include: { profile: true, studentDetail: true } },
        },
        orderBy: { voteCount: 'desc' },
      },
      _count: { select: { votes: true } },
    },
  })

  if (!election) throw { status: 404, message: 'Election not found' }

  const hasVoted = await prisma.vote.findFirst({
    where: { electionId: id, voterId: userId },
  })
  const voterToken = await prisma.voterToken.findFirst({
    where: { electionId: id, userId },
  })

  return {
    ...election,
    hasVoted: !!(hasVoted || voterToken?.hasVoted),
    voterCount: election._count.votes,
  }
}

// ── Add candidate ─────────────────────────────────────────

export const addCandidate = async ({ electionId, userId, position, manifesto, actorId }) => {
  const election = await prisma.election.findFirst({
    where: { id: electionId, deletedAt: null },
  })
  if (!election) throw { status: 404, message: 'Election not found' }
  if (election.status !== 'DRAFT') throw { status: 400, message: 'Cannot add candidates after election has started' }

  const existing = await prisma.candidate.findUnique({
    where: { electionId_userId: { electionId, userId } },
  })
  if (existing) throw { status: 409, message: 'This student is already a candidate in this election' }

  const candidate = await prisma.candidate.create({
    data: { electionId, userId, position, manifesto },
    include: { user: { include: { profile: true } } },
  })

  await writeAuditLog({
    actorId,
    action: 'CANDIDATE_ADDED',
    targetId: electionId,
    targetType: 'Election',
    metadata: { userId, position },
  })

  return candidate
}

// ── Update election status ────────────────────────────────

export const updateElectionStatus = async ({ id, status, actorId }) => {
  const election = await prisma.election.findFirst({
    where: { id, deletedAt: null },
  })
  if (!election) throw { status: 404, message: 'Election not found' }

  const validTransitions = {
    DRAFT: ['OPEN', 'CANCELLED'],
    OPEN: ['CLOSED', 'CANCELLED'],
    CLOSED: [],
    CANCELLED: [],
  }

  if (!validTransitions[election.status].includes(status)) {
    throw { status: 400, message: `Cannot transition from ${election.status} to ${status}` }
  }

  if (status === 'OPEN' && election.isAnonymous) {
    await issueVoterTokens(election)
  }

  const updated = await prisma.election.update({
    where: { id },
    data: { status },
  })

  await writeAuditLog({
    actorId,
    action: 'ELECTION_STATUS_CHANGED',
    targetId: id,
    targetType: 'Election',
    metadata: { from: election.status, to: status },
  })

  return updated
}

// ── Issue voter tokens (anonymous elections) ──────────────

const issueVoterTokens = async (election) => {
  const eligibilityFilter = {
    role: 'STUDENT',
    isActive: true,
    ...(election.eligibleDept || election.eligibleYear
      ? {
          studentDetail: {
            ...(election.eligibleDept && { department: election.eligibleDept }),
            ...(election.eligibleYear && { year: election.eligibleYear }),
          },
        }
      : {}),
  }

  const students = await prisma.user.findMany({ where: eligibilityFilter })

  await prisma.voterToken.createMany({
    data: students.map((s) => ({
      electionId: election.id,
      userId: s.id,
      token: crypto.randomBytes(32).toString('hex'),
    })),
    skipDuplicates: true,
  })
}

// ── Check voter eligibility ───────────────────────────────

const checkEligibility = async (election, userId) => {
  if (election.eligibleDept || election.eligibleYear) {
    const student = await prisma.studentDetail.findUnique({ where: { userId } })
    if (!student) throw { status: 403, message: 'Only students can vote in this election' }
    if (election.eligibleDept && student.department !== election.eligibleDept) {
      throw { status: 403, message: `This election is only for ${election.eligibleDept} students` }
    }
    if (election.eligibleYear && student.year !== election.eligibleYear) {
      throw { status: 403, message: `This election is only for Year ${election.eligibleYear} students` }
    }
  }
}

// ── Cast vote ─────────────────────────────────────────────

export const castVote = async ({ electionId, candidateId, userId }) => {
  const election = await prisma.election.findFirst({
    where: { id: electionId, deletedAt: null },
  })
  if (!election) throw { status: 404, message: 'Election not found' }
  if (election.status !== 'OPEN') throw { status: 400, message: 'This election is not currently open for voting' }
  if (new Date() > new Date(election.endsAt)) throw { status: 400, message: 'This election has ended' }

  await checkEligibility(election, userId)

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, electionId },
  })
  if (!candidate) throw { status: 404, message: 'Candidate not found in this election' }

  if (election.isAnonymous) {
    return castAnonymousVote({ election, candidateId, userId })
  }

  // Non-anonymous vote
  const existing = await prisma.vote.findFirst({
    where: { electionId, voterId: userId },
  })
  if (existing) throw { status: 409, message: 'You have already voted in this election' }

  await prisma.$transaction(async (tx) => {
    await tx.vote.create({
      data: { electionId, candidateId, voterId: userId },
    })
    await tx.candidate.update({
      where: { id: candidateId },
      data: { voteCount: { increment: 1 } },
    })
    await creditXP({
      userId,
      amount: 10,
      eventType: 'VOTE_CAST',
      description: `Voted in election: ${election.title}`,
      refId: electionId,
      tx,
    })
  })

  await notify({
    userId,
    type: 'VOTE_CAST',
    title: 'Vote recorded',
    body: `Your vote in "${election.title}" has been recorded.`,
    refId: electionId,
  })

  await writeAuditLog({
    actorId: userId,
    action: 'VOTE_CAST',
    targetId: electionId,
    targetType: 'Election',
    metadata: { candidateId },
  })

  return { message: 'Vote cast successfully' }
}

const castAnonymousVote = async ({ election, candidateId, userId }) => {
  const voterToken = await prisma.voterToken.findUnique({
    where: { electionId_userId: { electionId: election.id, userId } },
  })
  if (!voterToken) throw { status: 403, message: 'You are not eligible to vote in this election' }
  if (voterToken.hasVoted) throw { status: 409, message: 'You have already voted in this election' }

  await prisma.$transaction(async (tx) => {
    await tx.vote.create({
      data: { electionId: election.id, candidateId, voterTokenId: voterToken.id },
    })
    await tx.candidate.update({
      where: { id: candidateId },
      data: { voteCount: { increment: 1 } },
    })
    await tx.voterToken.update({
      where: { id: voterToken.id },
      data: { hasVoted: true },
    })
    await creditXP({
      userId,
      amount: 10,
      eventType: 'VOTE_CAST',
      description: `Voted in election: ${election.title}`,
      refId: election.id,
      tx,
    })
  })

  await writeAuditLog({
    actorId: userId,
    action: 'VOTE_CAST_ANONYMOUS',
    targetId: election.id,
    targetType: 'Election',
  })

  return { message: 'Vote cast successfully' }
}

// ── Get results ───────────────────────────────────────────

export const getResults = async (electionId) => {
  const election = await prisma.election.findFirst({
    where: { id: electionId, deletedAt: null },
    include: {
      candidates: {
        include: { user: { include: { profile: true, studentDetail: true } } },
        orderBy: { voteCount: 'desc' },
      },
      _count: { select: { votes: true } },
    },
  })
  if (!election) throw { status: 404, message: 'Election not found' }
  if (election.status === 'DRAFT') throw { status: 403, message: 'Results are not available yet' }

  const totalVotes = election._count.votes
  return {
    election,
    totalVotes,
    candidates: election.candidates.map((c) => ({
      ...c,
      percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0',
    })),
  }
}

// ── Delete election (soft) ────────────────────────────────

export const deleteElection = async (id, actorId) => {
  const election = await prisma.election.findFirst({ where: { id, deletedAt: null } })
  if (!election) throw { status: 404, message: 'Election not found' }
  if (election.status === 'OPEN') throw { status: 400, message: 'Cannot delete an active election' }

  await prisma.election.update({ where: { id }, data: { deletedAt: new Date() } })

  await writeAuditLog({
    actorId,
    action: 'ELECTION_DELETED',
    targetId: id,
    targetType: 'Election',
  })
}