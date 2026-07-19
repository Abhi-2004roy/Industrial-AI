import path from 'path'

/**
 * Normalize a stored upload reference to a web-safe `/uploads/<filename>` path.
 * Handles legacy absolute OS paths and bare filenames.
 */
export function normalizeStoredUploadPath(value) {
  if (!value) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/uploads/')) return value

  const fileName = value.split(/[/\\]/).pop()
  return fileName ? `/uploads/${fileName}` : value
}

export function getUploadFileName(storedPath) {
  if (!storedPath) return ''
  return storedPath.split(/[/\\]/).pop() || ''
}

export function resolveUploadAbsolutePath(storedPath, uploadsDir) {
  const fileName = getUploadFileName(storedPath)
  return fileName ? path.join(uploadsDir, fileName) : null
}

export function sanitizeUserForResponse(user) {
  if (!user) return user

  const plainUser = typeof user.toObject === 'function' ? user.toObject() : { ...user }

  delete plainUser.password
  delete plainUser.refreshToken
  delete plainUser.resetPasswordToken
  delete plainUser.resetPasswordExpire
  delete plainUser.emailVerificationToken
  delete plainUser.emailVerificationExpire

  if (plainUser.avatar) {
    plainUser.avatar = normalizeStoredUploadPath(plainUser.avatar)
  }

  return plainUser
}
