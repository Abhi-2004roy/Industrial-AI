import { Ionicons } from '@expo/vector-icons';

export type DrawerNavItem = {
  /** File name inside `app/(drawer)/` (route name). */
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/**
 * Left-sidebar sections, mirrored from
 * `client/src/components/navigation/Sidebar.jsx` navItems.
 */
export const DRAWER_ITEMS: DrawerNavItem[] = [
  { name: 'index', label: 'Dashboard', icon: 'grid-outline' },
  { name: 'documents', label: 'Documents', icon: 'document-text-outline' },
  { name: 'upload', label: 'Upload', icon: 'cloud-upload-outline' },
  { name: 'ai-chat', label: 'AI Assistant', icon: 'sparkles-outline' },
  { name: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  { name: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { name: 'users', label: 'Users', icon: 'people-outline' },
  { name: 'settings', label: 'Settings', icon: 'settings-outline' },
  { name: 'profile', label: 'Profile', icon: 'person-outline' },
];
