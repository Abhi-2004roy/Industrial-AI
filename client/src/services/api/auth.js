import apiClient from './client'

function getApiErrorMessage(error, fallback) {
  const message = error.response?.data?.message
  if (typeof message === 'string') return message
  if (Array.isArray(message)) return message.join(', ')
  return error.message || fallback
}

export async function login(credentials) {
  try {
    console.log('[auth.js.login] Sending login request with credentials:', credentials);
    const response = await apiClient.post('/auth/login', credentials)
    console.log('[auth.js.login] Login response:', response.data);
    if (!response.data?.data?.accessToken || !response.data?.data?.user) {
      throw new Error('Invalid login response from server')
    }
    return {
      token: response.data.data.accessToken,
      user: response.data.data.user,
    }
  } catch (error) {
    console.error('[auth.js.login] Login error:', error);
    throw new Error(getApiErrorMessage(error, 'Login failed'))
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
