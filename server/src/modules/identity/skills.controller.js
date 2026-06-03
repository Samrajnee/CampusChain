import { sendSuccess } from '../../lib/apiResponse.js';
import * as service from './skills.service.js';

export async function getMySkills(req, res, next) {
  try {
    const skills = await service.getMySkills(req.user.id);
    sendSuccess(res, 'Skills fetched', { skills });
  } catch (err) { next(err); }
}

export async function getUserSkills(req, res, next) {
  try {
    const skills = await service.getUserSkills(req.params.userId);
    sendSuccess(res, 'Skills fetched', { skills });
  } catch (err) { next(err); }
}

export async function addSkill(req, res, next) {
  try {
    const skill = await service.addSkill({
      userId: req.user.id,
      name:   req.body.name,
    });
    sendSuccess(res, 'Skill added', { skill }, 201);
  } catch (err) { next(err); }
}

export async function removeSkill(req, res, next) {
  try {
    await service.removeSkill({
      userId:  req.user.id,
      skillId: req.params.skillId,
    });
    sendSuccess(res, 'Skill removed', {});
  } catch (err) { next(err); }
}

export async function endorseSkill(req, res, next) {
  try {
    const endorsement = await service.endorseSkill({
      endorserId: req.user.id,
      endorsedId: req.params.userId,
      skillId:    req.body.skillId,
      note:       req.body.note,
      ipAddress:  req.ip,
    });
    sendSuccess(res, 'Skill endorsed', { endorsement });
  } catch (err) { next(err); }
}

export async function removeEndorsement(req, res, next) {
  try {
    await service.removeEndorsement({
      endorserId: req.user.id,
      skillId:    req.params.skillId,
      endorsedId: req.params.userId,
    });
    sendSuccess(res, 'Endorsement removed', {});
  } catch (err) { next(err); }
}

export async function searchSkills(req, res, next) {
  try {
    const skills = await service.searchSkills(req.query.q);
    sendSuccess(res, 'Skills found', { skills });
  } catch (err) { next(err); }
}