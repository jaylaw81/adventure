import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, desc, eq, gt, gte, isNull, lt, ne, notExists, or, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures, emailBlasts, emailBlastRecipients } from '@/lib/schema'
import { sendEmailBlast } from '@/lib/email'
import { buildSegmentWhere, type SegmentCondition } from '@/lib/segmentQuery'

const INACTIVE_DAYS = 30

function needsBillingWhereClause() {
  const now = new Date()
  // Mirrors the "needs_setup" category in getBillingInfo:
  // not org, not grandfathered, no active/trialing subscription,
  // trial expired or never set, grace period expired or never set,
  // and not past_due/canceled/paused (those are "issues").
  return and(
    eq(users.emailSubscribed, true),
    eq(users.grandfathered, false),
    ne(users.tier, 'organization'),
    or(isNull(users.subscriptionStatus), ne(users.subscriptionStatus, 'active')),
    or(isNull(users.subscriptionStatus), ne(users.subscriptionStatus, 'trialing')),
    or(isNull(users.trialEndsAt), lt(users.trialEndsAt, now)),
    or(isNull(users.gracePeriodEndsAt), lt(users.gracePeriodEndsAt, now)),
    or(isNull(users.subscriptionStatus), and(
      ne(users.subscriptionStatus, 'past_due'),
      ne(users.subscriptionStatus, 'canceled'),
      ne(users.subscriptionStatus, 'paused'),
    )),
  )
}

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
  const dayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const DAILY_LIMIT = parseInt(process.env.RESEND_DAILY_LIMIT ?? '0', 10)

  const [blasts, [counts], [inactiveRow], [trialEndedRow], deliveryStats, [usageRow]] = await Promise.all([
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
    db.select({ count: sql<number>`count(*)::int` }).from(users).where(needsBillingWhereClause()),
    db.select({
      blastId:   emailBlastRecipients.blastId,
      delivered: sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'delivered')::int`,
      failed:    sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'failed')::int`,
      bounced:   sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'bounced')::int`,
      pending:   sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'sent')::int`,
      queued:    sql<number>`count(*) filter (where ${emailBlastRecipients.status} = 'queued')::int`,
    }).from(emailBlastRecipients).groupBy(emailBlastRecipients.blastId),
    db.select({ sentToday: sql<number>`count(*)::int` })
      .from(emailBlastRecipients)
      .where(and(
        gte(emailBlastRecipients.sentAt, dayStart),
        ne(emailBlastRecipients.status, 'failed'),
        ne(emailBlastRecipients.status, 'queued'),
      )),
  ])

  const deliveryMap = Object.fromEntries(deliveryStats.map(s => [s.blastId, s]))

  const blastsWithStats = blasts.map(b => ({
    ...b,
    delivery: deliveryMap[b.id] ?? { delivered: 0, failed: 0, bounced: 0, pending: 0, queued: 0 },
  }))

  const stats = {
    ...counts,
    inactive: inactiveRow.count,
    needsBilling: trialEndedRow.count,
    sentToday: usageRow.sentToday,
    dailyLimit: DAILY_LIMIT,
  }
  return NextResponse.json({ blasts: blastsWithStats, stats })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, bodyHtml, audience = 'all', conditions, resendAudienceId, resendAudienceName } = await req.json() as {
    subject: string
    bodyHtml: string
    audience: 'all' | 'organization' | 'inactive' | 'needs_billing' | 'custom' | 'resend_audience'
    conditions?: SegmentCondition[]
    resendAudienceId?: string
    resendAudienceName?: string
  }
  if (!subject?.trim() || !bodyHtml?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
  }

  const cols = { email: users.email, displayName: users.displayName, unsubscribeToken: users.unsubscribeToken }

  // For Resend audience sends, fetch contacts directly from Resend API
  if (audience === 'resend_audience') {
    if (!resendAudienceId) {
      return NextResponse.json({ error: 'resendAudienceId is required' }, { status: 400 })
    }

    let resendContacts: { email: string; first_name: string | null; unsubscribed: boolean }[] = []
    try {
      const res = await fetch(`https://api.resend.com/audiences/${resendAudienceId}/contacts`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Resend API ${res.status}`)
      const body = await res.json()
      resendContacts = (body.data ?? []).filter((c: { unsubscribed: boolean }) => !c.unsubscribed)
    } catch (err) {
      return NextResponse.json({ error: 'Failed to fetch Resend audience contacts' }, { status: 502 })
    }

    const sentByEmail = session.user.email ?? 'admin'
    const [blast] = await db
      .insert(emailBlasts)
      .values({
        subject,
        bodyHtml,
        sentByEmail,
        recipientCount: 0,
        audience: 'resend_audience',
        segmentConditions: JSON.stringify({ audienceId: resendAudienceId, audienceName: resendAudienceName ?? resendAudienceId }),
      })
      .returning()

    const BATCH_SIZE = 4
    const BATCH_DELAY_MS = 1100
    const recipientRows: { blastId: string; email: string; resendId: string | null; status: string; error: string | null; sentAt: Date }[] = []

    for (let i = 0; i < resendContacts.length; i += BATCH_SIZE) {
      const batch = resendContacts.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(c =>
          sendEmailBlast({
            to: c.email,
            displayName: c.first_name || null,
            subject,
            bodyHtml,
            unsubscribeToken: c.email,
          })
        )
      )
      const batchSentAt = new Date()
      for (let j = 0; j < batch.length; j++) {
        const r = results[j]
        recipientRows.push({
          blastId: blast.id,
          email: batch[j].email,
          resendId: r.status === 'fulfilled' ? r.value : null,
          status: r.status === 'fulfilled' ? 'sent' : 'failed',
          error: r.status === 'rejected' ? String(r.reason) : null,
          sentAt: batchSentAt,
        })
      }
      if (i + BATCH_SIZE < resendContacts.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    const successCount = recipientRows.filter(r => r.status === 'sent').length
    if (recipientRows.length > 0) {
      await db.insert(emailBlastRecipients).values(recipientRows)
    }
    await db.update(emailBlasts).set({ recipientCount: successCount }).where(eq(emailBlasts.id, blast.id))

    return NextResponse.json({
      id: blast.id,
      recipientCount: successCount,
      total: resendContacts.length,
      failed: resendContacts.length - successCount,
    })
  }

  const recipients = await (() => {
    if (audience === 'organization') {
      return db.select(cols).from(users).where(and(eq(users.emailSubscribed, true), eq(users.tier, 'organization')))
    }
    if (audience === 'inactive') {
      return db.select(cols).from(users).where(inactiveWhereClause())
    }
    if (audience === 'needs_billing') {
      return db.select(cols).from(users).where(needsBillingWhereClause())
    }
    if (audience === 'custom' && conditions?.length) {
      const segWhere = buildSegmentWhere(conditions)
      return db.select(cols).from(users).where(and(eq(users.emailSubscribed, true), segWhere))
    }
    return db.select(cols).from(users).where(eq(users.emailSubscribed, true))
  })()

  const sentByEmail = session.user.email ?? 'admin'

  // Check daily quota and split if needed
  const DAILY_LIMIT = parseInt(process.env.RESEND_DAILY_LIMIT ?? '0', 10)
  const dayStart = new Date(new Date().setHours(0, 0, 0, 0))
  let sendNow = recipients
  let queueLater: typeof recipients = []

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
    sendNow = recipients.slice(0, remaining)
    queueLater = recipients.slice(remaining)
  }

  // Insert blast first so recipients can FK reference it
  const [blast] = await db
    .insert(emailBlasts)
    .values({
      subject,
      bodyHtml,
      sentByEmail,
      recipientCount: 0,
      audience,
      segmentConditions: audience === 'custom' && conditions?.length
        ? JSON.stringify(conditions)
        : null,
    })
    .returning()

  // Insert queued recipients immediately so they're tracked
  if (queueLater.length > 0) {
    await db.insert(emailBlastRecipients).values(
      queueLater.map(u => ({
        blastId: blast.id,
        email: u.email,
        resendId: null,
        status: 'queued',
        error: null,
      }))
    )
  }

  // Send in batches of 4 — Resend rate limit is 5 req/s
  const BATCH_SIZE = 4
  const BATCH_DELAY_MS = 1100

  const recipientRows: {
    blastId: string
    email: string
    resendId: string | null
    status: string
    error: string | null
    sentAt: Date
  }[] = []

  for (let i = 0; i < sendNow.length; i += BATCH_SIZE) {
    const batch = sendNow.slice(i, i + BATCH_SIZE)
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

    const batchSentAt = new Date()
    for (let j = 0; j < batch.length; j++) {
      const r = results[j]
      recipientRows.push({
        blastId: blast.id,
        email: batch[j].email,
        resendId: r.status === 'fulfilled' ? r.value : null,
        status: r.status === 'fulfilled' ? 'sent' : 'failed',
        error: r.status === 'rejected' ? String(r.reason) : null,
        sentAt: batchSentAt,
      })
    }

    if (i + BATCH_SIZE < sendNow.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  const successCount = recipientRows.filter(r => r.status === 'sent').length

  if (recipientRows.length > 0) {
    await db.insert(emailBlastRecipients).values(recipientRows)
  }

  await db.update(emailBlasts)
    .set({ recipientCount: successCount })
    .where(eq(emailBlasts.id, blast.id))

  return NextResponse.json({
    id: blast.id,
    recipientCount: successCount,
    total: recipients.length,
    failed: sendNow.length - successCount,
    queued: queueLater.length,
  })
}
