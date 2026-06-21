import { NextResponse } from 'next/server'
import { and, eq, gt, isNull, lt, ne, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { sendTrialExpiryReminder } from '@/lib/email'

export const maxDuration = 60

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const days3ahead = new Date(now.getTime() + 3 * 86_400_000)

  // Users whose trial ends within 3 days, not yet reminded, not already subscribed
  const candidates = await db
    .select({
      email: users.email,
      displayName: users.displayName,
      trialEndsAt: users.trialEndsAt,
      unsubscribeToken: users.unsubscribeToken,
    })
    .from(users)
    .where(and(
      eq(users.emailSubscribed, true),
      eq(users.status, 'active'),
      ne(users.tier, 'organization'),
      gt(users.trialEndsAt, now),
      lt(users.trialEndsAt, days3ahead),
      isNull(users.trialReminderSentAt),
      or(
        isNull(users.subscriptionStatus),
        and(
          ne(users.subscriptionStatus, 'active'),
          ne(users.subscriptionStatus, 'trialing'),
        ),
      ),
    ))

  if (candidates.length === 0) {
    return NextResponse.json({ skipped: 'No candidates' })
  }

  let sent = 0
  let failed = 0

  for (const u of candidates) {
    if (!u.trialEndsAt || !u.unsubscribeToken) continue
    try {
      await sendTrialExpiryReminder({
        to: u.email,
        displayName: u.displayName || null,
        trialEndsAt: u.trialEndsAt,
        unsubscribeToken: u.unsubscribeToken,
      })
      await db
        .update(users)
        .set({ trialReminderSentAt: new Date() })
        .where(eq(users.email, u.email))
      sent++
    } catch (err) {
      console.error(`Trial reminder failed for ${u.email}:`, err)
      failed++
    }
  }

  return NextResponse.json({ sent, failed })
}
