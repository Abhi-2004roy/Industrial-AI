import axios from 'axios'
import { STORAGE_KEYS } from '@/constants/theme'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  withCredentials: true, // Allow sending cookies
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = error.config?.url?.includes('/auth/login')
      || error.config?.url?.includes('/auth/register')

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
    return Promise.reject(error)
  }
)

export default apiClient

export function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
