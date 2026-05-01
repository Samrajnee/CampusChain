import prisma from '../../lib/prisma.js';

export async function getPlatformStats() {
  const [
    totalStudents,
    totalFaculty,
    totalEvents,
    totalElections,
    totalProposals,
    totalCertificates,
    totalClubs,
    totalGrievances,
    pendingBudget,
    pendingClubs,
    openElections,
    resolvedGrievances,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.user.count({
      where: {
        role: { in: ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL'] },
        isActive: true,
      },
    }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.election.count({ where: { deletedAt: null } }),
    prisma.proposal.count({ where: { deletedAt: null } }),
    prisma.certificate.count({ where: { isRevoked: false } }),
    prisma.club.count({ where: { deletedAt: null } }),
    prisma.grievance.count({ where: { deletedAt: null } }),
    prisma.budgetRequest.count({ where: { status: 'PENDING' } }),
    prisma.club.count({ where: { status: 'PENDING_APPROVAL', deletedAt: null } }),
    prisma.election.count({ where: { status: 'OPEN' } }),
    prisma.grievance.count({ where: { status: 'RESOLVED' } }),
  ]);

  return {
    totalStudents,
    totalFaculty,
    totalEvents,
    totalElections,
    totalProposals,
    totalCertificates,
    totalClubs,
    totalGrievances,
    pendingBudget,
    pendingClubs,
    openElections,
    resolvedGrievances,
  };
}

export async function searchStudents({ search, department, year, page, limit }) {
  const skip = (page - 1) * limit;

  const where = {
    role: 'STUDENT',
    isActive: true,
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          studentDetail: {
            studentId: { contains: search, mode: 'insensitive' },
          },
        },
      ],
    }),
    ...(department && {
      studentDetail: { department },
    }),
    ...(year && {
      studentDetail: { year },
    }),
  };

  // When multiple studentDetail filters needed, merge them
  if (department && year) {
    where.studentDetail = { department, year };
  } else if (department) {
    where.studentDetail = { department };
  } else if (year) {
    where.studentDetail = { year };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        studentDetail: {
          select: {
            studentId: true,
            department: true,
            year: true,
            semester: true,
            xpTotal: true,
            level: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    students: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getRecentAuditLogs({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPendingItems() {
  const [budgetRequests, pendingClubs, openGrievances] = await Promise.all([
    prisma.budgetRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        club: { select: { name: true } },
        requester: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
            email: true,
          },
        },
      },
    }),
    prisma.club.findMany({
      where: { status: 'PENDING_APPROVAL', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        members: {
          where: { role: 'PRESIDENT' },
          include: {
            user: {
              select: {
                profile: { select: { firstName: true, lastName: true } },
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.grievance.findMany({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ESCALATED'] },
        deletedAt: null,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        isAnonymous: true,
        createdAt: true,
        student: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
            email: true,
          },
        },
      },
    }),
  ]);

  return { budgetRequests, pendingClubs, openGrievances };
}