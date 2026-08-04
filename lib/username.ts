export const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/

export const RESERVED_USERNAMES = new Set([
  // top-level app/ routes
  'admin', 'api', 'demo', 'edit', 'forgot-password', 's', 'sign-in', 'sign-up',
  'reset-password', 'story', 'unsubscribe',
  // top-level app/(main)/ routes
  'blog', 'choose-your-own-adventure', 'create', 'explore', 'how-to', 'invite',
  'org', 'organizations', 'play', 'pricing', 'pricing-offer', 'privacy',
  'profile', 'subscribe', 'terms', 'u',
  // generic squatting / house-keeping words
  'me', 'about', 'contact', 'help', 'settings', 'login', 'logout', 'register',
  'www', 'null', 'undefined', 'support', 'dashboard', 'root',
])

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_REGEX.test(username)
}

export function isUsernameReserved(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase())
}

/** Full validation: format + reserved-word check. Returns an error message, or null if valid. Expects an already-trimmed, lowercased candidate. */
export function validateUsername(username: string): string | null {
  if (!isValidUsernameFormat(username)) {
    return 'Username must be 3-20 characters: lowercase letters, numbers, or underscores, starting with a letter.'
  }
  if (isUsernameReserved(username)) {
    return 'That username is reserved.'
  }
  return null
}
