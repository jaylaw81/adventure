import { NextResponse } from 'next/server'
import { and, eq, isNull, ne, or, lt, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { sendUpgradeNudgeEmail, isQuotaError } from '@/lib/email'

export const maxDuration = 60

const DAYS_AFTER_FIRST_STORY = 3 // give people time to finish and share their free story first
const MIN_WORDS = 200             // template stories start with ~100 placeholder words, so scene counts don't show real writing
const BATCH_SIZE = 40            // drains the existing backlog over a few days without tripping Resend limits

// Free users who've really written their one free story and never subscribed get one upgrade email.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - DAYS_AFTER_FIRST_STORY * 86_400_000)

  const candidates = await db
    .select({
      email: users.email,
      displayName: users.displayName,
      unsubscribeToken: users.unsubscribeToken,
      storyTitle: sql<string>`(select a.title from adventures a where a.user_email = ${users.email} order by a.created_at asc limit 1)`,
    })
    .from(users)
    .where(and(
      eq(users.emailSubscribed, true),
      eq(users.status, 'active'),
      ne(users.tier, 'organization'),
      eq(users.grandfathered, false),
      isNull(users.upgradeNudgeSentAt),
      isNull(users.subscriptionStatus),
      or(isNull(users.trialEndsAt), lt(users.trialEndsAt, now)),
      or(isNull(users.gracePeriodEndsAt), lt(users.gracePeriodEndsAt, now)),
      sql`exists (
        select 1 from adventures a
        where a.user_email = ${users.email} and a.created_at < ${cutoff}
          and (
            select coalesce(sum(array_length(regexp_split_to_array(trim(n.content), '\s+'), 1)), 0)
            from nodes n where n.adventure_id = a.id and trim(n.content) <> ''
          ) >= ${MIN_WORDS}
      )`,
      sql`not exists (select 1 from organization_members m where m.user_email = ${users.email})`,
    ))
    .limit(BATCH_SIZE)

  let sent = 0
  let failed = 0

  for (const u of candidates) {
    if (!u.unsubscribeToken) continue
    try {
      await sendUpgradeNudgeEmail({
        to: u.email,
        displayName: u.displayName || null,
        storyTitle: u.storyTitle || 'your story',
        unsubscribeToken: u.unsubscribeToken,
      })
      await db.update(users).set({ upgradeNudgeSentAt: new Date() }).where(eq(users.email, u.email))
      sent++
      await new Promise(r => setTimeout(r, 600)) // stay under Resend's per-second rate limit
    } catch (err) {
      console.error(`Upgrade nudge failed for ${u.email}:`, err)
      failed++
      if (isQuotaError(err)) break
    }
  }

  return NextResponse.json({ sent, failed })
}
