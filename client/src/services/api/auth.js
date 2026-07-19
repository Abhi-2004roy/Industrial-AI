import apiClient from './client'

export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials)
  return {
    token: response.data.data.accessToken,
    user: response.data.data.user,
  }
}

export async function signup(userData) {
  const response = await apiClient.post('/auth/register', userData)
  return {
    token: response.data.data.accessToken,
    user: response.data.data.user,
  }
}

export async function forgotPassword({ email }) {
  const response = await apiClient.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token, password) {
  const response = await apiClient.post(`/auth/reset-password/${token}`, { password })
  return response.data
}

export async function logout() {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me')
  return response.data.data
}

export async function updateProfile(data) {
  const response = await apiClient.put('/auth/me', data)
  return response.data.data
}
