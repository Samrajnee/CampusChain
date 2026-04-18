import apiClient from './client'

// Events
export const listEventsApi = () => apiClient.get('/events')
export const getEventApi = (id) => apiClient.get(`/events/${id}`)
export const createEventApi = (data) => apiClient.post('/events', data)
export const rsvpEventApi = (id) => apiClient.post(`/events/${id}/rsvp`)
export const markAttendanceApi = (id, data) => apiClient.post(`/events/${id}/attendance`, data)
export const updateEventStatusApi = (id, status) => apiClient.patch(`/events/${id}/status`, { status })
export const deleteEventApi = (id) => apiClient.delete(`/events/${id}`)

// Clubs
export const listClubsApi = () => apiClient.get('/clubs')
export const getClubApi = (id) => apiClient.get(`/clubs/${id}`)
export const createClubApi = (data) => apiClient.post('/clubs', data)
export const joinClubApi = (id) => apiClient.post(`/clubs/${id}/join`)
export const leaveClubApi = (id) => apiClient.post(`/clubs/${id}/leave`)
export const updateClubStatusApi = (id, data) => apiClient.patch(`/clubs/${id}/status`, data)

// Budget
export const listBudgetApi = (clubId) => apiClient.get('/budget', { params: { clubId } })
export const createBudgetApi = (data) => apiClient.post('/budget', data)
export const updateBudgetStatusApi = (id, data) => apiClient.patch(`/budget/${id}`, data)