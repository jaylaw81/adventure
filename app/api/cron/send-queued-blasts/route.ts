import { NextResponse } from 'next/server'
import { and, eq, gte, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, emailBlasts, emailBlastRecipients } from '@/lib/schema'
import { sendEmailBlast, isQuotaError } from '@/lib/email'

export const maxDuration = 300

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const DAILY_LIMIT = parseInt(process.env.RESEND_DAILY_LIMIT ?? '0', 10)
  if (DAILY_LIMIT === 0) {
    return NextResponse.json({ skipped: 'No daily limit configured' })
  }

  const dayStart = new Date(new Date().setHours(0, 0, 0, 0))

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
    return NextResponse.json({ skipped: 'Daily limit already reached', sentToday, dailyLimit: DAILY_LIMIT })
  }

  // Find all blasts that still have queued recipients, oldest first
  const queuedRecipients = await db
    .select({ id: emailBlastRecipients.id, email: emailBlastRecipients.email, blastId: emailBlastRecipients.blastId })
    .from(emailBlastRecipients)
    .where(eq(emailBlastRecipients.status, 'queued'))

  if (queuedRecipients.length === 0) {
    return NextResponse.json({ skipped: 'No queued recipients' })
  }

  // Group by blastId preserving order
  const blastGroups = new Map<string, typeof queuedRecipients>()
  for (const r of queuedRecipients) {
    if (!blastGroups.has(r.blastId)) blastGroups.set(r.blastId, [])
    blastGroups.get(r.blastId)!.push(r)
  }

  // Load blast content for each unique blastId
  const blastIds = [...blastGroups.keys()]
  const blastDetails = await db
    .select({ id: emailBlasts.id, subject: emailBlasts.subject, bodyHtml: emailBlasts.bodyHtml })
    .from(emailBlasts)
    .where(sql`${emailBlasts.id} = ANY(ARRAY[${sql.raw(blastIds.map(id => `'${id}'`).join(','))}]::uuid[])`)

  const blastMap = new Map(blastDetails.map(b => [b.id, b]))

  const BATCH_SIZE = 4
  const BATCH_DELAY_MS = 1100
  let quota = remaining
  const summary: { blastId: string; sent: number; failed: number; stillQueued: number }[] = []

  for (const [blastId, recipients] of blastGroups) {
    if (quota <= 0) break

    const blast = blastMap.get(blastId)
    if (!blast) continue

    const toSend = recipients.slice(0, quota)
    const stillQueued = recipients.length - toSend.length

    // Look up user details for unsubscribe tokens and display names
    const emails = toSend.map(r => r.email)
    const userDetails = await db
      .select({ email: users.email, displayName: users.displayName, unsubscribeToken: users.unsubscribeToken })
      .from(users)
      .where(eq(users.emailSubscribed, true))
      .then(all => all.filter(u => emails.includes(u.email)))

    const userMap = new Map(userDetails.map(u => [u.email, u]))

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
            subject: blast.subject,
            bodyHtml: blast.bodyHtml,
            unsubscribeToken: u?.unsubscribeToken ?? r.email,
          })
        })
      )

      for (let j = 0; j < batch.length; j++) {
        const r = results[j]
        const row = batch[j]
        const quota = r.status === 'rejected' && isQuotaError(r.reason)
        await db
          .update(emailBlastRecipients)
          .set({
            status: r.status === 'fulfilled' ? 'sent' : quota ? 'queued' : 'failed',
            resendId: r.status === 'fulfilled' ? r.value : null,
            error: r.status === 'rejected' && !quota ? String(r.reason) : null,
            sentAt: new Date(),
          })
          .where(eq(emailBlastRecipients.id, row.id))

        if (r.status === 'fulfilled') successCount++
        else if (!quota) failCount++
      }

      if (i + BATCH_SIZE < toSend.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    await db
      .update(emailBlasts)
      .set({ recipientCount: sql`${emailBlasts.recipientCount} + ${successCount}` })
      .where(eq(emailBlasts.id, blastId))

    quota -= toSend.length
    summary.push({ blastId, sent: successCount, failed: failCount, stillQueued })
  }

  return NextResponse.json({ processed: summary, remainingQuota: quota })
}
