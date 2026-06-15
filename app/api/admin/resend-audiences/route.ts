import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const RESEND_API = 'https://api.resend.com'

interface ResendAudience {
  id: string
  name: string
  created_at: string
}

interface ResendContact {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  unsubscribed: boolean
  created_at: string
}

async function resendFetch(path: string) {
  const res = await fetch(`${RESEND_API}${path}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Resend API error: ${res.status}`)
  return res.json()
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const audienceId = searchParams.get('audienceId')

  try {
    if (audienceId) {
      // Return contacts for a specific audience (used for recipient count preview)
      const body = await resendFetch(`/audiences/${audienceId}/contacts`)
      const contacts: ResendContact[] = body.data ?? []
      const active = contacts.filter(c => !c.unsubscribed)
      return NextResponse.json({ count: active.length })
    }

    // Return full audience list
    const body = await resendFetch('/audiences')
    const audiences: ResendAudience[] = body.data ?? []
    return NextResponse.json(audiences.map(a => ({ id: a.id, name: a.name })))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch from Resend'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
