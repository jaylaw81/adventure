export const CONSENT_VERSION = 1
export const CONSENT_COOKIE = 'sq_consent'

export type ConsentPreferences = {
  analytics: boolean
  advertising: boolean
  version: number
}

export function readConsentCookie(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null
  try {
    const match = document.cookie.match(/(?:^|; )sq_consent=([^;]*)/)
    if (!match) return null
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    if (typeof parsed !== 'object' || parsed.version !== CONSENT_VERSION) return null
    return parsed as ConsentPreferences
  } catch {
    return null
  }
}

export function writeConsentCookie(prefs: ConsentPreferences): void {
  const expires = new Date()
  expires.setDate(expires.getDate() + 365)
  document.cookie = [
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(prefs))}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
  ].join('; ')
}
