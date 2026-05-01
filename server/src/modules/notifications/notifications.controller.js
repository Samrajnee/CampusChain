import { sendSuccess } from '../../lib/apiResponse.js';
import * as service from './notifications.service.js';

export async function list(req, res, next) {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const result = await service.listNotifications({
      userId: req.user.id,
      page,
      limit,
      unreadOnly,
    });
    sendSuccess(res, 'Notifications fetched', result);
  } catch (err) {
    next(err);
  }
}

export async function unreadCount(req, res, next) {
  try {
    const count = await service.getUnreadCount(req.user.id);
    sendSuccess(res, 'Unread count fetched', { count });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const notification = await service.markRead({
      id: req.params.id,
      userId: req.user.id,
    });
    sendSuccess(res, 'Marked as read', { notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    const count = await service.markAllRead(req.user.id);
    sendSuccess(res, `${count} notifications marked as read`, { count });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await service.deleteNotification({ id: req.params.id, userId: req.user.id });
    sendSuccess(res, 'Notification deleted', {});
  } catch (err) {
    next(err);
  }
}

export async function clearRead(req, res, next) {
  try {
    const count = await service.clearReadNotifications(req.user.id);
    sendSuccess(res, `${count} read notifications cleared`, { count });
  } catch (err) {
    next(err);
  }
}