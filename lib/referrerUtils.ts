export type ReferrerCategory = 'direct' | 'search' | 'social' | 'referral' | 'email' | 'internal'

export interface ParsedReferrer {
  domain: string
  category: ReferrerCategory
}

const SEARCH_ENGINES = new Set([
  'google.com', 'google.co.uk', 'google.ca', 'google.com.au', 'google.co.in',
  'google.de', 'google.fr', 'google.co.jp', 'google.com.br',
  'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.com',
  'yandex.ru', 'ecosia.org', 'search.brave.com', 'ask.com', 'aol.com',
  'startpage.com', 'searx.me', 'swisscows.com',
])

// Maps raw hostname → canonical social domain
const SOCIAL_MAP: Record<string, string> = {
  'facebook.com': 'facebook.com',
  'fb.com': 'facebook.com',
  'm.facebook.com': 'facebook.com',
  'l.facebook.com': 'facebook.com',
  'lm.facebook.com': 'facebook.com',
  'instagram.com': 'instagram.com',
  'twitter.com': 'twitter.com',
  'x.com': 'twitter.com',
  't.co': 'twitter.com',
  'tiktok.com': 'tiktok.com',
  'vm.tiktok.com': 'tiktok.com',
  'reddit.com': 'reddit.com',
  'old.reddit.com': 'reddit.com',
  'redd.it': 'reddit.com',
  'youtube.com': 'youtube.com',
  'youtu.be': 'youtube.com',
  'm.youtube.com': 'youtube.com',
  'linkedin.com': 'linkedin.com',
  'lnkd.in': 'linkedin.com',
  'pinterest.com': 'pinterest.com',
  'pin.it': 'pinterest.com',
  'tumblr.com': 'tumblr.com',
  'discord.com': 'discord.com',
  'discordapp.com': 'discord.com',
  'discord.gg': 'discord.com',
  'whatsapp.com': 'whatsapp.com',
  'wa.me': 'whatsapp.com',
  'telegram.org': 'telegram.org',
  't.me': 'telegram.org',
  'snapchat.com': 'snapchat.com',
  'threads.net': 'threads.net',
  'mastodon.social': 'mastodon.social',
  'twitch.tv': 'twitch.tv',
  'bereal.com': 'bereal.com',
  'bluesky.app': 'bluesky.app',
  'bsky.app': 'bluesky.app',
}

const EMAIL_WEBMAIL = new Set([
  'mail.google.com', 'gmail.com',
  'outlook.com', 'outlook.live.com', 'outlook.office.com',
  'hotmail.com', 'live.com',
  'mail.yahoo.com', 'yahoo.mail.com',
  'protonmail.com', 'mail.proton.me',
  'hey.com', 'fastmail.com', 'zoho.com', 'zohomail.com',
])

const SITE_DOMAINS = ['storyquestor.com', 'localhost']

export function parseReferrer(rawReferer: string | null | undefined): ParsedReferrer {
  if (!rawReferer?.trim()) {
    return { domain: 'direct', category: 'direct' }
  }

  let hostname: string
  try {
    hostname = new URL(rawReferer).hostname.toLowerCase()
  } catch {
    return { domain: 'direct', category: 'direct' }
  }

  // Strip leading www.
  const host = hostname.replace(/^www\./, '')

  // Internal traffic
  if (SITE_DOMAINS.some(d => host === d || host.endsWith('.' + d))) {
    return { domain: 'storyquestor.com', category: 'internal' }
  }

  // Search engines (exact or subdomain match)
  if (SEARCH_ENGINES.has(host) || [...SEARCH_ENGINES].some(s => host.endsWith('.' + s))) {
    return { domain: host, category: 'search' }
  }

  // Social media (with canonical normalization)
  if (host in SOCIAL_MAP) {
    return { domain: SOCIAL_MAP[host], category: 'social' }
  }
  for (const [pattern, canonical] of Object.entries(SOCIAL_MAP)) {
    if (host.endsWith('.' + pattern)) {
      return { domain: canonical, category: 'social' }
    }
  }

  // Email webmail
  if (EMAIL_WEBMAIL.has(host) || [...EMAIL_WEBMAIL].some(e => host.endsWith('.' + e))) {
    return { domain: host, category: 'email' }
  }

  // Everything else is a referral
  return { domain: host, category: 'referral' }
}
