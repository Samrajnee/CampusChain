import api from './client.js';

export const getAnnouncements = (params) =>
  api.get('/announcements', { params }).then((r) => r.data);

export const getAnnouncement = (id) =>
  api.get(`/announcements/${id}`).then((r) => r.data);

export const getUnreadCount = () =>
  api.get('/announcements/unread-count').then((r) => r.data);

export const createAnnouncement = (data) =>
  api.post('/announcements', data).then((r) => r.data);

export const updateAnnouncement = (id, data) =>
  api.patch(`/announcements/${id}`, data).then((r) => r.data);

export const deleteAnnouncement = (id) =>
  api.delete(`/announcements/${id}`).then((r) => r.data);