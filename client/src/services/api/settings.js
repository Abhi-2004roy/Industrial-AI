import { delay } from './client'

const defaultSettings = {
  notifications: {
    email: true,
    push: true,
    documentProcessed: true,
    weeklyReport: true,
    aiQuotaWarning: true,
  },
  appearance: {
    theme: 'light',
    compactMode: false,
    sidebarCollapsed: false,
  },
  ai: {
    autoSummarize: true,
    language: 'en',
    responseLength: 'detailed',
  },
  privacy: {
    shareAnalytics: true,
    activityLog: true,
  },
}

export async function getSettings() {
  await delay(400)
  const stored = localStorage.getItem('industrial_ai_settings')
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
}

export async function updateSettings(settings) {
  await delay(500)
  const current = await getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem('industrial_ai_settings', JSON.stringify(updated))
  return updated
}

export async function updateProfile(data) {
  await delay(600)
  return { ...data, updatedAt: new Date().toISOString() }
}

export async function changePassword(data) {
  await delay(800)
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('Passwords do not match')
  }
  return { message: 'Password updated successfully' }
}
