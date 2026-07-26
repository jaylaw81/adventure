import { NextResponse } from 'next/server'
import { normalizeLanguageCode } from '@/lib/languages'

const MAX_STRINGS = 20
const MAX_TOTAL_CHARS = 15_000

interface GoogleTranslateResponse {
  data: {
    translations: Array<{ translatedText: string }>
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Translation not configured' }, { status: 503 })
  }

  let body: { texts: unknown; targetLanguage: unknown; sourceLanguage?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { texts, targetLanguage, sourceLanguage } = body

  if (!Array.isArray(texts) || texts.length === 0 || texts.length > MAX_STRINGS) {
    return NextResponse.json({ error: 'texts must be an array of 1–20 strings' }, { status: 400 })
  }
  if (typeof targetLanguage !== 'string' || !targetLanguage) {
    return NextResponse.json({ error: 'targetLanguage is required' }, { status: 400 })
  }

  const stringTexts = texts.map(t => (typeof t === 'string' ? t : String(t)))
  const totalChars = stringTexts.reduce((sum, t) => sum + t.length, 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    return NextResponse.json({ error: 'Content too large to translate' }, { status: 400 })
  }

  const target = normalizeLanguageCode(targetLanguage)
  const source = sourceLanguage && typeof sourceLanguage === 'string'
    ? normalizeLanguageCode(sourceLanguage)
    : undefined

  try {
    const url = new URL('https://translation.googleapis.com/language/translate/v2')
    url.searchParams.set('key', apiKey)

    const googleBody: Record<string, unknown> = {
      q: stringTexts,
      target,
      format: 'text',
    }
    if (source) googleBody.source = source

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Google Translate error:', res.status, errText)
      return NextResponse.json({ error: 'Translation service error' }, { status: 502 })
    }

    const data = (await res.json()) as GoogleTranslateResponse
    const translations = data.data.translations.map(t => t.translatedText)

    return NextResponse.json({ translations })
  } catch (err) {
    console.error('Translation fetch failed:', err)
    return NextResponse.json({ error: 'Translation unavailable' }, { status: 502 })
  }
}
