const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordBytes = value => new TextEncoder().encode(value).length

export function emailError(value) {
  const email = value.trim()
  if (!email) return 'Email is required.'
  if (email.length > 254 || !emailPattern.test(email)) return 'Enter a valid email address.'
  return ''
}

export function loginPasswordError(value) {
  if (!value) return 'Password is required.'
  if (value.length > 72 || passwordBytes(value) > 72) return 'Password must be no more than 72 bytes.'
  return ''
}

export function newPasswordError(value) {
  if (!value || !value.trim()) return 'Password is required.'
  if (Array.from(value).length < 8) return 'Password must contain at least 8 characters.'
  if (passwordBytes(value) > 72) return 'Password must be no more than 72 bytes.'
  return ''
}

export function displayNameError(value) {
  if (!value.trim()) return 'Display name is required.'
  if (value.length > 100) return 'Display name must be no more than 100 characters.'
  return ''
}

export function otpError(value) {
  return /^\d{6}$/.test(value) ? '' : 'Enter the 6-digit verification code.'
}
