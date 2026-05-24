import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, desc, eq, gt, notExists, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures, emailBlasts, emailBlastRecipients } from '@/lib/schema'
import { sendEmailBlast } from '@/lib/email'

const INACTIVE_DAYS = 30

function inactiveWhereClause() {
  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000)
  return and(
    eq(users.emailSubscribed, true),
    notExists(
      db.select({ e: adventures.userEmail }).from(adventures).where(
        and(eq(adventures.userEmail, users.email), gt(adventures.updatedAt, cutoff))
      )
    )
  )
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000)

  const [blasts, [counts], [inactiveRow], deliveryStats] = await Promise.all([
    db.select().from(emailBlasts).orderBy(desc(emailBlasts.sentAt)),
    db.select({
      subscribed:   sql<number>`count(*) filter (where ${users.emailSubscribed} = true)::int`,
      unsubscribed: sql<number>`count(*) filter (where ${users.emailSubscribed} = false)::int`,
      org:          sql<number>`count(*) filter (where ${users.emailSubscribed} = true and ${users.tier} = 'organization')::int`,
    }).from(users),
    db.select({ count: sql<number>`count(*)::int` }).from(users).where(
      and(
        eq(users.emailSubscribed, true),
        notExists(
          db.select({ e: adventures.userEmail }).from(adventures).where(
            and(eq(adventures.userEmail, users.email), gt(adventures.updatedAt, cutoff))
          )
        )
      )
    ),
    db.select({
      blastId:   emailBlastRecipients.blastId,
      delivered: sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'delivered')::int`,
      failed:    sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'failed')::int`,
      bounced:   sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'bounced')::int`,
      pending:   sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'sent')::int`,
    }).from(emailBlastRecipients).groupBy(emailBlastRecipients.blastId),
  ])

  const deliveryMap = Object.fromEntries(deliveryStats.map(s => [s.blastId, s]))

  const blastsWithStats = blasts.map(b => ({
    ...b,
    delivery: deliveryMap[b.id] ?? { delivered: 0, failed: 0, bounced: 0, pending: 0 },
  }))

  const stats = { ...counts, inactive: inactiveRow.count }
  return NextResponse.json({ blasts: blastsWithStats, stats })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, bodyHtml, audience = 'all' } = await req.json()
  if (!subject?.trim() || !bodyHtml?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
  }

  const cols = { email: users.email, displayName: users.displayName, unsubscribeToken: users.unsubscribeToken }

  const recipients = await (() => {
    if (audience === 'organization') {
      return db.select(cols).from(users).where(and(eq(users.emailSubscribed, true), eq(users.tier, 'organization')))
    }
    if (audience === 'inactive') {
      return db.select(cols).from(users).where(inactiveWhereClause())
    }
    return db.select(cols).from(users).where(eq(users.emailSubscribed, true))
  })()

  const sentByEmail = session.user.email ?? 'admin'

  // Insert blast first so recipients can FK reference it
  const [blast] = await db
    .insert(emailBlasts)
    .values({ subject, bodyHtml, sentByEmail, recipientCount: 0 })
    .returning()

  // Send in batches of 4 — Resend rate limit is 5 req/s
  const BATCH_SIZE = 4
  const BATCH_DELAY_MS = 1100

  const recipientRows: {
    blastId: string
    email: string
    resendId: string | null
    status: string
    error: string | null
  }[] = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(u =>
        sendEmailBlast({
          to: u.email,
          displayName: u.displayName || null,
          subject,
          bodyHtml,
          unsubscribeToken: u.unsubscribeToken ?? u.email,
        })
      )
    )

    for (let j = 0; j < batch.length; j++) {
      const r = results[j]
      recipientRows.push({
        blastId: blast.id,
        email: batch[j].email,
        resendId: r.status === 'fulfilled' ? r.value : null,
        status: r.status === 'fulfilled' ? 'sent' : 'failed',
        error: r.status === 'rejected' ? String(r.reason) : null,
      })
    }

    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  const successCount = recipientRows.filter(r => r.status === 'sent').length

  // Bulk insert recipient tracking rows
  if (recipientRows.length > 0) {
    await db.insert(emailBlastRecipients).values(recipientRows)
  }

  // Update blast with actual sent count
  await db.update(emailBlasts)
    .set({ recipientCount: successCount })
    .where(eq(emailBlasts.id, blast.id))

  return NextResponse.json({
    id: blast.id,
    recipientCount: successCount,
    total: recipients.length,
    failed: recipients.length - successCount,
  })
}
