import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteFeedback } from '@/lib/schema'

const VALID_TYPES = ['question', 'concern', 'other'] as const
const MAX_MESSAGE = 2000
const MAX_URL = 500

// Strip HTML tags and common XSS vectors from plain-text input
function sanitize(input: string, maxLen: number): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '')        // remove HTML tags
    .replace(/javascript:/gi, '')   // remove javascript: URIs
    .replace(/on\w+\s*=/gi, '')     // remove event handler attributes (onclick=, onerror=, …)
    .slice(0, maxLen)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const rawType = String(body.type ?? 'other').trim()
    const rawMessage = String(body.message ?? '')
    const rawEmail = String(body.email ?? '').trim()
    const rawPage = String(body.pageUrl ?? '').trim()

    if (!VALID_TYPES.includes(rawType as (typeof VALID_TYPES)[number])) {
      return NextResponse.json({ error: 'Invalid feedback type.' }, { status: 400 })
    }

    const message = sanitize(rawMessage, MAX_MESSAGE)
    if (message.length < 10) {
      return NextResponse.json({ error: 'Message too short.' }, { status: 400 })
    }

    const pageUrl = sanitize(rawPage, MAX_URL)

    // Use session email if logged in, otherwise accept the provided email
    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email
      ?? (rawEmail.includes('@') ? rawEmail.slice(0, 200) : null)

    await db.insert(siteFeedback).values({
      userEmail: userEmail ?? null,
      type: rawType as (typeof VALID_TYPES)[number],
      message,
      pageUrl: pageUrl || null,
      status: 'new',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit feedback.' }, { status: 500 })
  }
}
