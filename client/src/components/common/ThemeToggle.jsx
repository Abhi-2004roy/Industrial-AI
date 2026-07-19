import { Moon, Sun } from 'lucide-react'
import { useThemeContext } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-3 rounded-full transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600' 
          : 'bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400'
        }
        hover:scale-110 shadow-lg
        ${isDark 
          ? 'shadow-purple-500/50' 
          : 'shadow-pink-400/50'
        }
        hover:${isDark 
          ? 'shadow-purple-500/70' 
          : 'shadow-pink-400/70'
        }
      `}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-6 h-6 text-white" />
      ) : (
        <Moon className="w-6 h-6 text-gray-800" />
      )}
    </button>
  )
}
