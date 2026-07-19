import { Bell, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/context/AuthContext'
import { useThemeContext } from '@/context/ThemeContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuthContext()
  const { isDark } = useThemeContext()

  return (
    <header className={`h-16 flex items-center justify-between px-6 transition-colors duration-300 border-b border-border ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-surface'
    }`}>
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Search className="w-5 h-5 text-muted" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

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

