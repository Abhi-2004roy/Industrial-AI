import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/context/AuthContext'
import { useThemeContext } from '@/context/ThemeContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuthContext()
  const { isDark } = useThemeContext()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const goToDocumentsSearch = (query = searchQuery) => {
    const trimmed = query.trim()
    const path = trimmed
      ? `/dashboard/documents?search=${encodeURIComponent(trimmed)}`
      : '/dashboard/documents'
    navigate(path)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    goToDocumentsSearch(value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    goToDocumentsSearch()
  }

  const handleSearchFocus = () => {
    if (window.location.pathname !== '/dashboard/documents') {
      navigate('/dashboard/documents')
    }
  }

  return (
    <header className={`h-16 flex items-center justify-between px-6 transition-colors duration-300 border-b border-border ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-surface'
    }`}>
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-4 flex-1 max-w-xl cursor-text"
        onClick={handleSearchFocus}
      >
        <Search className="w-5 h-5 text-muted flex-shrink-0" />
        <Input
          type="search"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text"
        />
      </form>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
