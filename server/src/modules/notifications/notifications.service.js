import prisma from '../../lib/prisma.js';

// ── Core notify() helper ───────────────────────────────────────────────────────
// Every other service imports this and calls it after their action.
// It persists the notification AND emits it over Socket.IO if the user
// is currently connected.

let _io = null; // Socket.IO instance, injected at startup

export function injectIO(io) {
  _io = io;
}

export async function notify({ userId, type, title, body, refId = null }) {
  // Persist to DB
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, refId },
  });

  // Real-time push if user has an active socket room
  if (_io) {
    _io.to(`user:${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      refId: notification.refId,
      isRead: false,
      createdAt: notification.createdAt,
    });
  }

  return notification;
}

// ── Bulk notify ────────────────────────────────────────────────────────────────
// Notify multiple users at once (e.g. new announcement, election opened).

export async function notifyMany({ userIds, type, title, body, refId = null }) {
  if (!userIds || userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type, title, body, refId })),
    skipDuplicates: true,
  });

  if (_io) {
    for (const userId of userIds) {
      _io.to(`user:${userId}`).emit('notification', {
        type,
        title,
        body,
        refId,
        isRead: false,
        createdAt: new Date(),
      });
    }
  }
}

// ── List notifications ─────────────────────────────────────────────────────────

export async function listNotifications({ userId, page = 1, limit = 30, unreadOnly = false }) {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(unreadOnly && { isRead: false }),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Unread count only (used by bell badge) ────────────────────────────────────

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

// ── Mark one as read ──────────────────────────────────────────────────────────

export async function markRead({ id, userId }) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notification) throw Object.assign(new Error('Not found'), { status: 404 });

  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}

// ── Mark all as read ──────────────────────────────────────────────────────────

export async function markAllRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return result.count;
}

// ── Delete one ────────────────────────────────────────────────────────────────

export async function deleteNotification({ id, userId }) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notification) throw Object.assign(new Error('Not found'), { status: 404 });
  await prisma.notification.delete({ where: { id } });
}

// ── Delete all read ───────────────────────────────────────────────────────────

export async function clearReadNotifications(userId) {
  const result = await prisma.notification.deleteMany({
    where: { userId, isRead: true },
  });
  return result.count;
}