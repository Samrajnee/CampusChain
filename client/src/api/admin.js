import api from './client.js';

export const getAdminStats = () =>
  api.get('/admin/stats').then((r) => r.data);

export const searchStudents = (params) =>
  api.get('/admin/students', { params }).then((r) => r.data);

export const getAuditLogs = (params) =>
  api.get('/admin/audit-logs', { params }).then((r) => r.data);

export const getPendingItems = () =>
  api.get('/admin/pending').then((r) => r.data);