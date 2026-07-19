/**
 * Build a full URL for files served from the backend `/uploads` directory.
 */
export function getFileUrl(filePath) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(
    /\/api\/v1\/?$/,
    ''
  )

  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath

  let normalizedPath = filePath

  // Legacy records may contain absolute OS paths — extract filename only.
  if (/^[a-zA-Z]:\\/.test(filePath) || filePath.includes('\\')) {
    normalizedPath = `/uploads/${filePath.split(/[/\\]/).pop()}`
  } else if (filePath.startsWith('/uploads/')) {
    normalizedPath = filePath
  } else {
    normalizedPath = `/uploads/${filePath.replace(/^\/+/, '')}`
  }

  return `${baseUrl}${normalizedPath}`
}
