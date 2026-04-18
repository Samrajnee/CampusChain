import apiClient from './client'

export const registerApi = (data) => apiClient.post('/auth/register', data)
export const loginApi = (data) => apiClient.post('/auth/login', data)
export const getMeApi = () => apiClient.get('/auth/me')
export const logoutApi = () => apiClient.post('/auth/logout')
export const forgotPasswordApi = (email) => apiClient.post('/auth/forgot-password', { email })
export const resetPasswordApi = (data) => apiClient.post('/auth/reset-password', data)