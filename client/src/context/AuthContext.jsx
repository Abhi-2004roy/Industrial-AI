import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { STORAGE_KEYS } from '@/constants/theme'
import * as authApi from '@/services/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserFromToken = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (storedToken) {
      try {
        const currentUser = await authApi.getCurrentUser()
        setToken(storedToken)
        setUser(currentUser)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser))
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUserFromToken()
  }, [loadUserFromToken])

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
    return response
  }, [])

  const signup = useCallback(async (userData) => {
    const response = await authApi.signup(userData)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
    return response
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
    setUser(updated)
  }, [user])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, token, loading, login, signup, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}
