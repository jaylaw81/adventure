import { NextResponse } from 'next/server'
import { and, eq, isNull, isNotNull, lt, lte, ne, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { sendInactivityReminderEmail } from '@/lib/email'
import { sql } from 'drizzle-orm'

export const maxDuration = 120

const JOB_NAME = 'inactivity-reminder'
const INACTIVITY_DAYS = 10      // account must be inactive for this long
const COOLDOWN_DAYS = 7         // minimum gap between emails to the same user

async function upsertCronLog(jobName: string, runAt: Date, result: string) {
  const { cronLogs } = await import('@/lib/schema')
  await db
    .insert(cronLogs)
    .values({ jobName, lastRunAt: runAt, lastRunResult: result })
    .onConflictDoUpdate({
      target: cronLogs.jobName,
      set: { lastRunAt: runAt, lastRunResult: result },
    })
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const inactiveCutoff = new Date(now.getTime() - INACTIVITY_DAYS * 86_400_000)
  const cooldownCutoff  = new Date(now.getTime() - COOLDOWN_DAYS  * 86_400_000)

  // Candidates: signed up 10+ days ago, never subscribed, inactive 10+ days,
  // not already emailed within the last 7 days.
  const candidates = await db
    .select({
      email: users.email,
      displayName: users.displayName,
      unsubscribeToken: users.unsubscribeToken,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(and(
      eq(users.emailSubscribed, true),
      eq(users.status, 'active'),
      ne(users.tier, 'organization'),
      eq(users.grandfathered, false),
      // Never had an active/trialing Stripe subscription
      or(
        isNull(users.subscriptionStatus),
        ne(users.subscriptionStatus, 'active'),
        ne(users.subscriptionStatus, 'trialing'),
      ),
      // Account created 10+ days ago
      lte(users.createdAt, inactiveCutoff),
      // Last login (or creation if never logged back in) is 10+ days ago
      or(
        and(isNotNull(users.lastLoginAt), lt(users.lastLoginAt, inactiveCutoff)),
        and(isNull(users.lastLoginAt),    lte(users.createdAt, inactiveCutoff)),
      ),
      // Haven't been emailed within the cooldown window
      or(
        isNull(users.inactivityReminderSentAt),
        lt(users.inactivityReminderSentAt, cooldownCutoff),
      ),
    ))
    .limit(50)

  if (candidates.length === 0) {
    await upsertCronLog(JOB_NAME, now, JSON.stringify({ sent: 0, failed: 0, reason: 'no candidates' }))
    return NextResponse.json({ skipped: 'No candidates' })
  }

  let sent = 0
  let failed = 0
  const sentEmails: string[] = []

  for (const u of candidates) {
    if (!u.unsubscribeToken) continue
    const lastActive = u.lastLoginAt ?? u.createdAt
    const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / 86_400_000)
    try {
      await sendInactivityReminderEmail({
        to: u.email,
        displayName: u.displayName || null,
        unsubscribeToken: u.unsubscribeToken,
        daysSinceActive,
      })
      await db
        .update(users)
        .set({ inactivityReminderSentAt: now })
        .where(eq(users.email, u.email))
      sentEmails.push(u.email)
      sent++
    } catch (err) {
      console.error(`Inactivity reminder failed for ${u.email}:`, err)
      failed++
    }
  }

  await upsertCronLog(JOB_NAME, now, JSON.stringify({ sent, failed, recipients: sentEmails }))

  return NextResponse.json({ sent, failed })
}
