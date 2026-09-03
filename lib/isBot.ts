/**
 * Rough crawler / bot detection from a User-Agent string.
 *
 * Used to skip side-effecting work (read counts, referrer logging) when the
 * request is a search engine, social scraper, or LLM crawler rather than a real
 * reader. Deliberately conservative — a missed bot just means one stray count.
 */
const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|pinterest|redditbot|whatsapp|telegrambot|discordbot|slackbot|vkshare|W3C_Validator|baiduspider|yandex|duckduckbot|ia_archiver|semrush|ahrefs|mj12bot|dotbot|petalbot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexitybot|amazonbot|google-extended|bytespider|ccbot|applebot|headlesschrome|lighthouse|python-requests|curl\/|wget\//i

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true // no UA at all is almost never a real browser
  return BOT_UA.test(ua)
}
