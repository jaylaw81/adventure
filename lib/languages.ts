export interface Language {
  code: string
  name: string
  nativeName: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文（简体）' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文（繁體）' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
]

export function getLanguageName(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.name ?? code
}

/**
 * Normalises a BCP-47 locale string to the codes used in this app.
 * e.g. 'en-US' → 'en', 'zh-TW' → 'zh-TW', 'zh-CN' → 'zh'
 */
export function normalizeLanguageCode(code: string): string {
  const lower = code.toLowerCase()
  if (lower.startsWith('zh-tw') || lower.startsWith('zh-hk') || lower.startsWith('zh-hant')) return 'zh-TW'
  if (lower.startsWith('zh')) return 'zh'
  return lower.split('-')[0].split('_')[0]
}
