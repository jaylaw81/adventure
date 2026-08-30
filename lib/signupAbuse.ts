import { headers } from 'next/headers'

// Domains for disposable/temporary email services — used to sign up repeatedly
// and bypass the free trial. Not exhaustive; extend as new ones are observed.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'getnada.com',
  'mailnesia.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'sharklasers.com', 'mintemail.com', 'mytemp.email', 'moakt.com',
  'emailondeck.com', 'mailcatch.com', 'spamgourmet.com', 'burnermail.io',
  'mohmal.com', 'inboxbear.com', 'tempinbox.com', 'discard.email',
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1]
  return !!domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)
}

function firstForwardedIp(value: string | null): string | null {
  const first = value?.split(',')[0]?.trim()
  return first || null
}

// For route handlers with a plain Request object (e.g. app/api/auth/register).
export function getIpFromRequest(req: Request): string | null {
  return firstForwardedIp(req.headers.get('x-forwarded-for')) || req.headers.get('x-real-ip')
}

// For code running inside the request scope without direct Request access
// (e.g. NextAuth callbacks) — reads the same headers via next/headers.
export async function getIpFromServerHeaders(): Promise<string | null> {
  const h = await headers()
  return firstForwardedIp(h.get('x-forwarded-for')) || h.get('x-real-ip')
}
