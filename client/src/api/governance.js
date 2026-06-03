import apiClient from './client'

// Proposals
export const listProposalsApi = () => apiClient.get('/proposals')
export const getProposals = (id) => apiClient.get(`/proposals/${id}`)
export const createProposal = (data) => apiClient.post('/proposals', data)
export const voteOnProposal = (id, isUpvote) => apiClient.post(`/proposals/${id}/vote`, { isUpvote })
export const updateProposalStatusApi = (id, data) => apiClient.patch(`/proposals/${id}/status`, data)
export const deleteProposalApi = (id) => apiClient.delete(`/proposals/${id}`)

// Grievances
export const listGrievancesApi = () => apiClient.get('/grievances')
export const getGrievances = (id) => apiClient.get(`/grievances/${id}`)
export const createGrievance = (data) => apiClient.post('/grievances', data)
export const updateGrievanceStatusApi = (id, data) => apiClient.patch(`/grievances/${id}/status`, data)

// Polls
export const getPolls = () => apiClient.get('/polls')
export const createPollApi = (data) => apiClient.post('/polls', data)
export const respondToPoll = (id, pollOptionId) => apiClient.post(`/polls/${id}/respond`, { pollOptionId })