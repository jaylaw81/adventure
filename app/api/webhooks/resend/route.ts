import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailBlastRecipients } from '@/lib/schema'

// Configure this URL in your Resend dashboard:
// Dashboard → Webhooks → Add endpoint → https://yourdomain.com/api/webhooks/resend
// Select events: email.delivered, email.bounced, email.complained
//
// Copy the signing secret from Resend and set RESEND_WEBHOOK_SECRET in your env vars.
// Without it the endpoint accepts all requests unauthenticated.

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()

  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (secret) {
    const wh = new Webhook(secret)
    try {
      wh.verify(body, {
        'svix-id': req.headers.get('svix-id') ?? '',
        'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
        'svix-signature': req.headers.get('svix-signature') ?? '',
      })
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: { type: string; data: { email_id: string } }
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, data } = payload
  if (!data?.email_id) {
    return NextResponse.json({ ok: true }) // ignore unrecognised events
  }

  if (type === 'email.delivered') {
    await db
      .update(emailBlastRecipients)
      .set({ status: 'delivered', deliveredAt: new Date() })
      .where(eq(emailBlastRecipients.resendId, data.email_id))
  } else if (type === 'email.bounced') {
    await db
      .update(emailBlastRecipients)
      .set({ status: 'bounced' })
      .where(eq(emailBlastRecipients.resendId, data.email_id))
  } else if (type === 'email.complained') {
    await db
      .update(emailBlastRecipients)
      .set({ status: 'complained' })
      .where(eq(emailBlastRecipients.resendId, data.email_id))
  }

  return NextResponse.json({ ok: true })
}
