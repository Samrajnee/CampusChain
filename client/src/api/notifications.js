import api from './client.js';

export const getNotifications = (params) =>
  api.get('/notifications', { params }).then((r) => r.data);

export const getUnreadCount = () =>
  api.get('/notifications/unread-count').then((r) => r.data);

export const markRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () =>
  api.patch('/notifications/mark-all-read').then((r) => r.data);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then((r) => r.data);

export const clearReadNotifications = () =>
  api.delete('/notifications/clear-read').then((r) => r.data);