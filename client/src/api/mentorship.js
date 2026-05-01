import api from './client.js';

export const getMentorships  = (params) =>
  api.get('/mentorship', { params }).then((r) => r.data);

export const getMentorship   = (id) =>
  api.get(`/mentorship/${id}`).then((r) => r.data);

export const createMentorship = (data) =>
  api.post('/mentorship', data).then((r) => r.data);

export const acceptMentorship = (id) =>
  api.patch(`/mentorship/${id}/accept`).then((r) => r.data);

export const completeMentorship = (id) =>
  api.patch(`/mentorship/${id}/complete`).then((r) => r.data);

export const cancelMentorship = (id) =>
  api.patch(`/mentorship/${id}/cancel`).then((r) => r.data);

export const closeMentorship = (id) =>
  api.patch(`/mentorship/${id}/close`).then((r) => r.data);