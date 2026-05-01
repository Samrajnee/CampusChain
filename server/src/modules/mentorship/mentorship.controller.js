import { sendSuccess } from '../../lib/apiResponse.js';
import * as service from './mentorship.service.js';

export async function list(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await service.listMentorships({
      userId: req.user.id,
      role: req.user.role,
      status: status || undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    sendSuccess(res, 'Mentorships fetched', result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const mentorship = await service.getMentorship({
      id: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });
    sendSuccess(res, 'Mentorship fetched', { mentorship });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const mentorship = await service.createRequest({
      menteeId: req.user.id,
      topic: req.body.topic,
      description: req.body.description,
    });
    sendSuccess(res, 'Mentorship request created', { mentorship }, 201);
  } catch (err) {
    next(err);
  }
}

export async function accept(req, res, next) {
  try {
    const mentorship = await service.acceptRequest({
      id: req.params.id,
      mentorId: req.user.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 'Mentorship accepted', { mentorship });
  } catch (err) {
    next(err);
  }
}

export async function complete(req, res, next) {
  try {
    await service.completeMentorship({
      id: req.params.id,
      actorId: req.user.id,
      role: req.user.role,
      ipAddress: req.ip,
    });
    sendSuccess(res, 'Mentorship completed', {});
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    await service.cancelRequest({
      id: req.params.id,
      actorId: req.user.id,
      role: req.user.role,
      ipAddress: req.ip,
    });
    sendSuccess(res, 'Mentorship cancelled', {});
  } catch (err) {
    next(err);
  }
}

export async function close(req, res, next) {
  try {
    await service.closeMentorship({
      id: req.params.id,
      actorId: req.user.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 'Mentorship closed', {});
  } catch (err) {
    next(err);
  }
}