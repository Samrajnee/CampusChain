import apiClient from './client'

export const getCertificates = () => apiClient.get('/certificates')
export const verifyCertificateApi = (code) => apiClient.get(`/verify/${code}`)
export const issueCertificateApi = (data) => apiClient.post('/certificates', data)
export const revokeCertificateApi = (id, reason) => apiClient.patch(`/certificates/${id}/revoke`, { reason })

export const listBadgesApi = () => apiClient.get('/badges')
export const getMyBadgesApi = () => apiClient.get('/badges/me')
export const awardBadgeApi = (data) => apiClient.post('/badges/award', data)

export const updateProfile = (data) => apiClient.put('/profile', data)
export const getXPTimelineApi = () => apiClient.get('/xp/timeline')
export const getProfile = (slug) => apiClient.get(`/portfolio/${slug}`)

export const getPortfolio = (slug) =>
  api.get(`/portfolio/${slug}`).then((r) => r.data);

export const getLeaderboard = (params) => apiClient.get('/leaderboard', { params })
export const getDirectory = (params) => apiClient.get('/directory', { params })