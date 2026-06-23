import { NextResponse } from 'next/server'
import { and, eq, exists, gte, isNull, lt, ne, notExists, or, sql } from 'drizzle-orm'
import { inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, adventures, cronLogs } from '@/lib/schema'
import { sendReEngagementEmail } from '@/lib/email'

export const maxDuration = 120

const JOB_NAME = 're-engagement'
const PER_USER_COOLDOWN_DAYS = 7

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const perUserCutoff = new Date(now.getTime() - PER_USER_COOLDOWN_DAYS * 86_400_000)
  const days30ago = new Date(now.getTime() - 30 * 86_400_000)

  // Users who have stories but none updated in 30+ days.
  // Per-user cooldown: skip anyone emailed within the last 7 days.
  const candidates = await db
    .select({
      email: users.email,
      displayName: users.displayName,
      unsubscribeToken: users.unsubscribeToken,
    })
    .from(users)
    .where(and(
      eq(users.emailSubscribed, true),
      eq(users.status, 'active'),
      ne(users.tier, 'organization'),
      or(
        isNull(users.reEngagementSentAt),
        lt(users.reEngagementSentAt, perUserCutoff),
      ),
      // Has at least one story
      exists(
        db.select({ x: adventures.id })
          .from(adventures)
          .where(eq(adventures.userEmail, users.email))
      ),
      // But no story updated in the last 30 days
      notExists(
        db.select({ x: adventures.id })
          .from(adventures)
          .where(and(
            eq(adventures.userEmail, users.email),
            gte(adventures.updatedAt, days30ago),
          ))
      ),
    ))
    .limit(50)

  if (candidates.length === 0) {
    await upsertCronLog(JOB_NAME, now, JSON.stringify({ sent: 0, failed: 0, reason: 'no candidates' }))
    return NextResponse.json({ skipped: 'No candidates' })
  }

  // Get story counts for all candidates in one query
  const emails = candidates.map(u => u.email)
  const storyCounts = await db
    .select({
      userEmail: adventures.userEmail,
      count: sql<number>`count(*)::int`,
    })
    .from(adventures)
    .where(inArray(adventures.userEmail, emails))
    .groupBy(adventures.userEmail)

  const storyCountMap = new Map(storyCounts.map(r => [r.userEmail, r.count]))

  let sent = 0
  let failed = 0
  const sentEmails: string[] = []

  for (const u of candidates) {
    if (!u.unsubscribeToken) continue
    const storyCount = storyCountMap.get(u.email) ?? 1
    try {
      await sendReEngagementEmail({
        to: u.email,
        displayName: u.displayName || null,
        storyCount,
        unsubscribeToken: u.unsubscribeToken,
      })
      await db
        .update(users)
        .set({ reEngagementSentAt: now })
        .where(eq(users.email, u.email))
      sentEmails.push(u.email)
      sent++
    } catch (err) {
      console.error(`Re-engagement email failed for ${u.email}:`, err)
      failed++
    }
  }

  await upsertCronLog(JOB_NAME, now, JSON.stringify({ sent, failed, recipients: sentEmails }))

  return NextResponse.json({ sent, failed })
}

async function upsertCronLog(jobName: string, runAt: Date, result: string) {
  await db
    .insert(cronLogs)
    .values({ jobName, lastRunAt: runAt, lastRunResult: result })
    .onConflictDoUpdate({
      target: cronLogs.jobName,
      set: { lastRunAt: runAt, lastRunResult: result },
    })
}
