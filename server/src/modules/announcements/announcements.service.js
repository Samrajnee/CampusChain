import { notifyMany } from '../notifications/notifications.service.js';
import prisma from '../../lib/prisma.js';
import { writeAuditLog } from '../../lib/audit.js';

export async function listAnnouncements({ userId, role, department, year, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    AND: [
      {
        OR: [
          { targetRole: null },
          { targetRole: role },
        ],
      },
      {
        OR: [
          { targetDept: null },
          { targetDept: department ?? undefined },
        ],
      },
      {
        OR: [
          { targetYear: null },
          { targetYear: year ?? undefined },
        ],
      },
    ],
  };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
      include: {
        createdByUser: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true } },
            role: true,
          },
        },
        reads: {
          where: { userId },
          select: { readAt: true },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  // Mark unread announcements as read (background, no await)
  const unreadIds = announcements
    .filter((a) => a.reads.length === 0)
    .map((a) => a.id);

  if (unreadIds.length > 0) {
    prisma.announcementRead
      .createMany({
        data: unreadIds.map((announcementId) => ({ announcementId, userId })),
        skipDuplicates: true,
      })
      .catch(() => {});
  }

  return {
    announcements: announcements.map((a) => ({
      ...a,
      isRead: a.reads.length > 0,
      reads: undefined,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAnnouncement({ id, userId }) {
  const announcement = await prisma.announcement.findFirst({
    where: { id, deletedAt: null },
    include: {
      createdByUser: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true } },
          role: true,
        },
      },
      reads: {
        where: { userId },
        select: { readAt: true },
      },
    },
  });

  if (!announcement) throw Object.assign(new Error('Announcement not found'), { status: 404 });

  // Mark as read if not already
  await prisma.announcementRead.upsert({
    where: { announcementId_userId: { announcementId: id, userId } },
    create: { announcementId: id, userId },
    update: {},
  });

  return { ...announcement, isRead: true, reads: undefined };
}

export async function createAnnouncement({ actorId, ipAddress, data }) {
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      body: data.body,
      targetRole: data.targetRole ?? null,
      targetDept: data.targetDept ?? null,
      targetYear: data.targetYear ?? null,
      isPinned: data.isPinned ?? false,
      createdBy: actorId,
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true } },
          role: true,
        },
      },
    },
  });

  const targetedUsers = await prisma.user.findMany({
  where: {
    isActive: true,
    ...(announcement.targetRole && { role: announcement.targetRole }),
    ...(announcement.targetDept && {
      studentDetail: { department: announcement.targetDept },
    }),
    ...(announcement.targetYear && {
      studentDetail: { year: announcement.targetYear },
    }),
  },
  select: { id: true },
});

await notifyMany({
  userIds: targetedUsers.map((u) => u.id).filter((id) => id !== actorId),
  type: 'ANNOUNCEMENT_READ',
  title: announcement.title,
  body: announcement.body.slice(0, 120) + (announcement.body.length > 120 ? '...' : ''),
  refId: announcement.id,
}); 
  await writeAuditLog({
    actorId,
    action: 'ANNOUNCEMENT_CREATED',
    targetId: announcement.id,
    targetType: 'Announcement',
    metadata: { title: announcement.title, isPinned: announcement.isPinned },
    ipAddress,
  });

  return announcement;
}

export async function updateAnnouncement({ id, actorId, role, ipAddress, data }) {
  const existing = await prisma.announcement.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw Object.assign(new Error('Announcement not found'), { status: 404 });

  const ROLE_HIERARCHY = [
    'STUDENT', 'LAB_ASSISTANT', 'LIBRARIAN', 'TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN',
  ];
  const actorLevel = ROLE_HIERARCHY.indexOf(role);
  const creatorRole = 'TEACHER'; // minimum role to create
  const isOwner = existing.createdBy === actorId;
  const isHigherAdmin = actorLevel >= ROLE_HIERARCHY.indexOf('HOD');

  if (!isOwner && !isHigherAdmin) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.targetRole !== undefined && { targetRole: data.targetRole }),
      ...(data.targetDept !== undefined && { targetDept: data.targetDept }),
      ...(data.targetYear !== undefined && { targetYear: data.targetYear }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true } },
          role: true,
        },
      },
    },
  });

  await writeAuditLog({
    actorId,
    action: 'ANNOUNCEMENT_UPDATED',
    targetId: id,
    targetType: 'Announcement',
    metadata: data,
    ipAddress,
  });

  return updated;
}

export async function deleteAnnouncement({ id, actorId, role, ipAddress }) {
  const existing = await prisma.announcement.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw Object.assign(new Error('Announcement not found'), { status: 404 });

  const ROLE_HIERARCHY = [
    'STUDENT', 'LAB_ASSISTANT', 'LIBRARIAN', 'TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN',
  ];
  const actorLevel = ROLE_HIERARCHY.indexOf(role);
  const isOwner = existing.createdBy === actorId;
  const isHigherAdmin = actorLevel >= ROLE_HIERARCHY.indexOf('HOD');

  if (!isOwner && !isHigherAdmin) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  await prisma.announcement.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    actorId,
    action: 'ANNOUNCEMENT_DELETED',
    targetId: id,
    targetType: 'Announcement',
    metadata: { title: existing.title },
    ipAddress,
  });
}

export async function getUnreadCount({ userId, role, department, year }) {
  const where = {
    deletedAt: null,
    AND: [
      { OR: [{ targetRole: null }, { targetRole: role }] },
      { OR: [{ targetDept: null }, { targetDept: department ?? undefined }] },
      { OR: [{ targetYear: null }, { targetYear: year ?? undefined }] },
    ],
    reads: { none: { userId } },
  };

  const count = await prisma.announcement.count({ where });
  return count;
}