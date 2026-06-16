import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq, gte, ne, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, emailBlasts, emailBlastRecipients } from '@/lib/schema'
import { sendEmailBlast } from '@/lib/email'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ blastId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { blastId } = await params

  const [original] = await db.select().from(emailBlasts).where(eq(emailBlasts.id, blastId))
  if (!original) return NextResponse.json({ error: 'Blast not found' }, { status: 404 })

  const queued = await db
    .select({ id: emailBlastRecipients.id, email: emailBlastRecipients.email })
    .from(emailBlastRecipients)
    .where(and(eq(emailBlastRecipients.blastId, blastId), eq(emailBlastRecipients.status, 'queued')))

  if (queued.length === 0) {
    return NextResponse.json({ error: 'No queued recipients for this blast' }, { status: 400 })
  }

  // Check remaining daily quota
  const DAILY_LIMIT = parseInt(process.env.RESEND_DAILY_LIMIT ?? '0', 10)
  const dayStart = new Date(new Date().setHours(0, 0, 0, 0))
  let canSend = queued.length

  if (DAILY_LIMIT > 0) {
    const [{ sentToday }] = await db
      .select({ sentToday: sql<number>`count(*)::int` })
      .from(emailBlastRecipients)
      .where(and(
        gte(emailBlastRecipients.sentAt, dayStart),
        ne(emailBlastRecipients.status, 'failed'),
        ne(emailBlastRecipients.status, 'queued'),
      ))
    const remaining = Math.max(0, DAILY_LIMIT - sentToday)
    if (remaining === 0) {
      return NextResponse.json({ error: 'Daily send limit reached. The queued recipients will be sent automatically after midnight.' }, { status: 429 })
    }
    canSend = Math.min(queued.length, remaining)
  }

  const toSend = queued.slice(0, canSend)
  const stillQueued = queued.slice(canSend)

  // For DB users, look up display names and unsubscribe tokens
  const emails = toSend.map(r => r.email)
  const userDetails = await db
    .select({ email: users.email, displayName: users.displayName, unsubscribeToken: users.unsubscribeToken })
    .from(users)
    .where(eq(users.emailSubscribed, true))
    .then(all => all.filter(u => emails.includes(u.email)))

  const userMap = new Map(userDetails.map(u => [u.email, u]))

  const BATCH_SIZE = 4
  const BATCH_DELAY_MS = 1100
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
    const batch = toSend.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(r => {
        const u = userMap.get(r.email)
        return sendEmailBlast({
          to: r.email,
          displayName: u?.displayName || null,
          subject: original.subject,
          bodyHtml: original.bodyHtml,
          unsubscribeToken: u?.unsubscribeToken ?? r.email,
        })
      })
    )

    for (let j = 0; j < batch.length; j++) {
      const r = results[j]
      const row = batch[j]
      await db
        .update(emailBlastRecipients)
        .set({
          status: r.status === 'fulfilled' ? 'sent' : 'failed',
          resendId: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? String(r.reason) : null,
          sentAt: new Date(),
        })
        .where(eq(emailBlastRecipients.id, row.id))

      if (r.status === 'fulfilled') successCount++
      else failCount++
    }

    if (i + BATCH_SIZE < toSend.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  // Increment blast's recipientCount by newly sent
  await db
    .update(emailBlasts)
    .set({ recipientCount: sql`${emailBlasts.recipientCount} + ${successCount}` })
    .where(eq(emailBlasts.id, blastId))

  return NextResponse.json({
    sent: successCount,
    failed: failCount,
    stillQueued: stillQueued.length,
  })
}
