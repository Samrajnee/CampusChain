import apiClient from './client'

export const listElectionsApi = () => apiClient.get('/elections')
export const getElectionApi = (id) => apiClient.get(`/elections/${id}`)
export const getResultsApi = (id) => apiClient.get(`/elections/${id}/results`)
export const castVoteApi = (id, candidateId) => apiClient.post(`/elections/${id}/vote`, { candidateId })
export const createElectionApi = (data) => apiClient.post('/elections', data)
export const addCandidateApi = (id, data) => apiClient.post(`/elections/${id}/candidates`, data)
export const updateElectionStatusApi = (id, status) => apiClient.patch(`/elections/${id}/status`, { status })
export const deleteElectionApi = (id) => apiClient.delete(`/elections/${id}`)