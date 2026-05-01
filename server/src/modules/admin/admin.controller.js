import { sendSuccess, sendError } from '../../lib/apiResponse.js';
import * as service from './admin.service.js';

export async function stats(req, res, next) {
  try {
    const data = await service.getPlatformStats();
    sendSuccess(res, 'Platform stats fetched', data);
  } catch (err) {
    next(err);
  }
}

export async function studentSearch(req, res, next) {
  try {
    const { search, department, year, page, limit } = req.query;
    const result = await service.searchStudents({
      search: search || undefined,
      department: department || undefined,
      year: year ? parseInt(year) : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    sendSuccess(res, 'Students fetched', result);
  } catch (err) {
    next(err);
  }
}

export async function auditLogs(req, res, next) {
  try {
    const result = await service.getRecentAuditLogs({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    sendSuccess(res, 'Audit logs fetched', result);
  } catch (err) {
    next(err);
  }
}

export async function pendingItems(req, res, next) {
  try {
    const data = await service.getPendingItems();
    sendSuccess(res, 'Pending items fetched', data);
  } catch (err) {
    next(err);
  }
}