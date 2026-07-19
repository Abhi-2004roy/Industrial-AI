export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const passwordRules = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
}

export function validateEmail(email) {
  return emailPattern.test(email)
}

export function validatePassword(password) {
  return password.length >= passwordRules.minLength && passwordRules.pattern.test(password)
}

export function validateRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0
}
