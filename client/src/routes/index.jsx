import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import Landing from '@/pages/Landing/Landing'
import Login from '@/pages/Authentication/Login'
import Signup from '@/pages/Authentication/Signup'
import ForgotPassword from '@/pages/Authentication/ForgotPassword'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Documents from '@/pages/Documents/Documents'
import UploadDocument from '@/pages/Documents/Upload'
import DocumentDetail from '@/pages/Documents/DocumentDetail'
import Analytics from '@/pages/Analytics/Analytics'
import Settings from '@/pages/Settings/Settings'
import Profile from '@/pages/Profile/Profile'
import Notifications from '@/pages/Notifications/Notifications'
import UserManagement from '@/pages/UserManagement/UserManagement'
import AIChat from '@/pages/AIChat'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: (
          <PublicRoute>
            <Landing />
          </PublicRoute>
        )
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        )
      },
      {
        path: '/signup',
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        )
      },
      {
        path: '/forgot-password',
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        )
      }
    ]
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/dashboard/documents',
        element: <Documents />
      },
      {
        path: '/dashboard/upload',
        element: <UploadDocument />
      },
      {
        path: '/dashboard/ai-chat',
        element: <AIChat />
      },
      {
        path: '/dashboard/document/:id',
        element: <DocumentDetail />
      },
      {
        path: '/dashboard/analytics',
        element: <Analytics />
      },
      {
        path: '/dashboard/settings',
        element: <Settings />
      },
      {
        path: '/dashboard/profile',
        element: <Profile />
      },
      {
        path: '/dashboard/notifications',
        element: <Notifications />
      },
      {
        path: '/dashboard/users',
        element: <UserManagement />
      }
    ]
  }
])

