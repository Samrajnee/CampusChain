import { sendSuccess, sendError } from '../../lib/apiResponse.js';
import * as service from './announcements.service.js';

export async function list(req, res, next) {
  try {
    const { id: userId, role } = req.user;
    const student = req.user.studentDetail;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await service.listAnnouncements({
      userId,
      role,
      department: student?.department ?? null,
      year: student?.year ?? null,
      page,
      limit,
    });

    sendSuccess(res, 'Announcements fetched', result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const announcement = await service.getAnnouncement({
      id: req.params.id,
      userId: req.user.id,
    });
    sendSuccess(res, 'Announcement fetched', { announcement });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const announcement = await service.createAnnouncement({
      actorId: req.user.id,
      ipAddress: req.ip,
      data: req.body,
    });
    sendSuccess(res, 'Announcement created', { announcement }, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const announcement = await service.updateAnnouncement({
      id: req.params.id,
      actorId: req.user.id,
      role: req.user.role,
      ipAddress: req.ip,
      data: req.body,
    });
    sendSuccess(res, 'Announcement updated', { announcement });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await service.deleteAnnouncement({
      id: req.params.id,
      actorId: req.user.id,
      role: req.user.role,
      ipAddress: req.ip,
    });
    sendSuccess(res, 'Announcement deleted', {});
  } catch (err) {
    next(err);
  }
}

export async function unreadCount(req, res, next) {
  try {
    const { id: userId, role } = req.user;
    const student = req.user.studentDetail;
    const count = await service.getUnreadCount({
      userId,
      role,
      department: student?.department ?? null,
      year: student?.year ?? null,
    });
    sendSuccess(res, 'Unread count fetched', { count });
  } catch (err) {
    next(err);
  }
}