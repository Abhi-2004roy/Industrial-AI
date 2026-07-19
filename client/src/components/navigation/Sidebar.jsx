import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Upload,
  BarChart3,
  Bell,
  Users,
  Settings,
  User,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthContext } from '@/context/AuthContext'
import { useThemeContext } from '@/context/ThemeContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Documents', path: '/dashboard/documents' },
  { icon: Upload, label: 'Upload', path: '/dashboard/upload' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
  { icon: Users, label: 'Users', path: '/dashboard/users' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuthContext()
  const { isDark } = useThemeContext()
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const [isOpen, setIsOpen] = useState(!isMobile)

  const toggleSidebar = () => setIsOpen(!isOpen)

  if (isMobile && isOpen) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="absolute left-0 top-0 h-full w-80 bg-sidebar text-white"
        >
          <SidebarContent onClose={() => setIsOpen(false)} />
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-40 p-2 rounded-lg ${
            isDark 
              ? 'bg-sidebar text-white' 
              : 'bg-white text-slate-800 shadow-md'
          }`}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 280 : 0 }}
        className={`hidden lg:flex h-screen flex-col border-r border-border ${
          isDark 
            ? 'bg-sidebar text-white' 
            : 'bg-white text-slate-800'
        }`}
      >
        {isOpen && <SidebarContent />}
      </motion.div>
    </>
  )
}

function SidebarContent({ onClose }) {
  const location = useLocation()
  const { user } = useAuthContext()
  const { isDark } = useThemeContext()

  return (
    <div className="h-full flex flex-col">
      <div className={`p-6 border-b border-border`}>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>IAI</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Industrial AI</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            onClick={onClose}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavLink({ item, isActive, onClick }) {
  const { isDark } = useThemeContext()
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        isActive
          ? isDark 
            ? 'bg-sidebar-active text-white' 
            : 'bg-primary text-white'
          : isDark 
            ? 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-slate-800'
      )}
    >
      <item.icon className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
    </Link>
  )
}

