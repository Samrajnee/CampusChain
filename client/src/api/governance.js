import apiClient from './client'

// Proposals
export const listProposalsApi = () => apiClient.get('/proposals')
export const getProposalApi = (id) => apiClient.get(`/proposals/${id}`)
export const createProposalApi = (data) => apiClient.post('/proposals', data)
export const voteProposalApi = (id, isUpvote) => apiClient.post(`/proposals/${id}/vote`, { isUpvote })
export const updateProposalStatusApi = (id, data) => apiClient.patch(`/proposals/${id}/status`, data)
export const deleteProposalApi = (id) => apiClient.delete(`/proposals/${id}`)

// Grievances
export const listGrievancesApi = () => apiClient.get('/grievances')
export const getGrievanceApi = (id) => apiClient.get(`/grievances/${id}`)
export const createGrievanceApi = (data) => apiClient.post('/grievances', data)
export const updateGrievanceStatusApi = (id, data) => apiClient.patch(`/grievances/${id}/status`, data)

// Polls
export const listPollsApi = () => apiClient.get('/polls')
export const createPollApi = (data) => apiClient.post('/polls', data)
export const respondToPollApi = (id, pollOptionId) => apiClient.post(`/polls/${id}/respond`, { pollOptionId })