import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailBlastRecipients } from '@/lib/schema'

// Configure this URL in your Resend dashboard:
// Dashboard → Webhooks → Add endpoint → https://yourdomain.com/api/webhooks/resend
// Select events: email.delivered, email.bounced, email.complained
//
// Optionally set RESEND_WEBHOOK_SECRET in .env.local and in the Resend dashboard
// to verify webhook signatures. Without it the endpoint is unauthenticated.

function verifySecret(req: NextRequest): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return true // verification disabled
  return req.headers.get('x-resend-signature') === secret
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { type: string; data: { email_id: string } }
  try {
    payload = await req.json()
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
