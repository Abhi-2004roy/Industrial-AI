export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/dashboard/documents',
  UPLOAD: '/dashboard/upload',
  DOCUMENT_DETAIL: '/dashboard/document/:id',
  ANALYTICS: '/dashboard/analytics',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  USERS: '/dashboard/users',
  NOTIFICATIONS: '/dashboard/notifications',
}

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Documents', path: ROUTES.DOCUMENTS, icon: 'FileText' },
  { label: 'Upload', path: ROUTES.UPLOAD, icon: 'Upload' },
  { label: 'Analytics', path: ROUTES.ANALYTICS, icon: 'BarChart3' },
  { label: 'Users', path: ROUTES.USERS, icon: 'Users' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
]

export const DOCUMENT_TYPES = ['Manual', 'SOP', 'Report', 'Specification', 'Training', 'Safety']

export const DOCUMENT_STATUS = {
  PROCESSED: 'processed',
  PROCESSING: 'processing',
  FAILED: 'failed',
  PENDING: 'pending',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
}
