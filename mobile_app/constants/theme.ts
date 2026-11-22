/**
 * Theme palettes for the mobile app.
 *
 * `LightPalette` mirrors the web client theme tokens
 * (`client/src/styles/globals.css`) so mobile matches the desktop look.
 * `DarkPalette` is a deep-slate dark theme with the same token names.
 *
 * Components consume the active palette via `useTheme()` (see
 * `context/ThemeContext.tsx`) so switching themes updates the whole UI.
 */

export interface Palette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  sidebar: string;
  sidebarHover: string;
  sidebarActive: string;
  surface: string;
  surfaceAlt: string;
  background: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  destructive: string;
  text: string;
  textMuted: string;
  sidebarText: string;
}

export const LightPalette: Palette = {
  primary: '#1b4d8c',
  primaryDark: '#0f2d54',
  primaryLight: '#2563eb',
  accent: '#f97316',
  sidebar: '#0f172a',
  sidebarHover: '#1e293b',
  sidebarActive: '#1b4d8c',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  background: '#f1f5f9',
  muted: '#64748b',
  border: '#e2e8f0',
  success: '#22c55e',
  warning: '#eab308',
  destructive: '#ef4444',
  text: '#0f172a',
  textMuted: '#64748b',
  sidebarText: '#cbd5e1',
};

export const DarkPalette: Palette = {
  primary: '#3b82f6',
  primaryDark: '#0b1220',
  primaryLight: '#60a5fa',
  accent: '#f97316',
  sidebar: '#0b1220',
  sidebarHover: '#1e293b',
  sidebarActive: '#3b82f6',
  surface: '#111827',
  surfaceAlt: '#1e293b',
  background: '#0b1220',
  muted: '#94a3b8',
  border: '#334155',
  success: '#22c55e',
  warning: '#eab308',
  destructive: '#ef4444',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  sidebarText: '#cbd5e1',
};
