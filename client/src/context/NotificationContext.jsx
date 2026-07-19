import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { mockNotifications } from '@/constants/mockData'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [panelOpen, setPanelOpen] = useState(false)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: String(Date.now()), read: false, createdAt: new Date().toISOString(), ...notification },
      ...prev,
    ])
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const togglePanel = useCallback(() => setPanelOpen((prev) => !prev), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      panelOpen,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification,
      togglePanel,
      closePanel,
      setPanelOpen,
    }),
    [notifications, unreadCount, panelOpen, markAsRead, markAllAsRead, addNotification, removeNotification, togglePanel, closePanel]
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider')
  return context
}
