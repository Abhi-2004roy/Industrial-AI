import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { STORAGE_KEYS, THEMES } from '@/constants/theme'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.LIGHT
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove(THEMES.LIGHT, THEMES.DARK)
    root.classList.add(theme)
    
    // Update CSS variables for dark/light mode
    if (theme === THEMES.DARK) {
      document.body.style.background = 'linear-gradient(to bottom right, #0f172a, rgba(88, 28, 135, 0.3))'
      document.body.style.color = '#f8fafc'
    } else {
      document.body.style.backgroundColor = '#f1f5f9'
      document.body.style.background = '#f1f5f9'
      document.body.style.color = '#0f172a'
    }
    
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === THEMES.DARK }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider')
  return context
}
