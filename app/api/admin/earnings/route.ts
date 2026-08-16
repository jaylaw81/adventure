import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import type { BillingInterval } from '@/lib/pricing'

// Normalize a subscription amount to a monthly-equivalent for MRR/ARR math and bucketing.
const MONTHLY_MULTIPLIER: Record<BillingInterval, number> = { day: 30.44, week: 4.345, month: 1 }

function toMonthlyCents(amountCents: number, interval: string | null): number {
  const mult = MONTHLY_MULTIPLIER[(interval as BillingInterval) ?? 'month'] ?? 1
  return amountCents * mult
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      tier: users.tier,
      grandfathered: users.grandfathered,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionAmountCents: users.subscriptionAmountCents,
      subscriptionInterval: users.subscriptionInterval,
      trialEndsAt: users.trialEndsAt,
      gracePeriodEndsAt: users.gracePeriodEndsAt,
    })
    .from(users)

  // Classify each user
  const now = Date.now()

  function daysLeft(d: Date | string | null): number | null {
    if (!d) return null
    const ms = new Date(d).getTime() - now
    if (ms <= 0) return null
    return Math.ceil(ms / 86_400_000)
  }

  type Category = 'active' | 'trial' | 'grace' | 'needs_setup' | 'issues' | 'org' | 'grandfathered'

  function classify(u: typeof allUsers[0]): { category: Category; amountCents: number; monthlyCents: number } {
    const amt = u.subscriptionAmountCents ?? 0
    const monthlyCents = toMonthlyCents(amt, u.subscriptionInterval)
    if (u.tier === 'organization') return { category: 'org', amountCents: 0, monthlyCents: 0 }
    if (u.grandfathered) return { category: 'grandfathered', amountCents: 0, monthlyCents: 0 }
    if (u.subscriptionStatus === 'active') return { category: 'active', amountCents: amt, monthlyCents }
    const trialDays = daysLeft(u.trialEndsAt)
    if (u.subscriptionStatus === 'trialing' || trialDays !== null) return { category: 'trial', amountCents: amt, monthlyCents }
    if (daysLeft(u.gracePeriodEndsAt) !== null) return { category: 'grace', amountCents: amt, monthlyCents }
    if (u.subscriptionStatus === 'past_due') return { category: 'issues', amountCents: amt, monthlyCents }
    if (u.subscriptionStatus === 'canceled' || u.subscriptionStatus === 'paused') return { category: 'issues', amountCents: 0, monthlyCents: 0 }
    return { category: 'needs_setup', amountCents: 0, monthlyCents: 0 }
  }

  // MRR from active subscribers only — amounts are normalized to a monthly-equivalent
  // before summing, so weekly/daily subscribers aren't undercounted.
  let mrrCents = 0
  let activeCount = 0
  let trialCount = 0
  let trialMonthlySum = 0
  let graceCount = 0
  let needsSetupCount = 0
  let issuesCount = 0
  let orgCount = 0
  let grandfatheredCount = 0

  // Revenue buckets, keyed by monthly-equivalent amount so weekly/monthly plans compare fairly.
  const buckets: Record<string, number> = {
    '$2': 0, '$3–$4': 0, '$5': 0, '$6–$9': 0, '$10': 0, '$11–$19': 0, '$20+': 0,
  }

  const activeSubscribers: {
    email: string; displayName: string; amountCents: number; interval: string; monthlyCents: number; status: string
  }[] = []

  for (const u of allUsers) {
    const { category, amountCents, monthlyCents } = classify(u)
    switch (category) {
      case 'active':
        mrrCents += monthlyCents
        activeCount++
        activeSubscribers.push({
          email: u.email,
          displayName: u.displayName,
          amountCents,
          interval: u.subscriptionInterval ?? 'month',
          monthlyCents,
          status: 'active',
        })
        // Bucket by monthly-equivalent
        if (monthlyCents <= 200) buckets['$2']++
        else if (monthlyCents <= 400) buckets['$3–$4']++
        else if (monthlyCents <= 500) buckets['$5']++
        else if (monthlyCents <= 900) buckets['$6–$9']++
        else if (monthlyCents <= 1000) buckets['$10']++
        else if (monthlyCents <= 1900) buckets['$11–$19']++
        else buckets['$20+']++
        break
      case 'trial':
        trialCount++
        trialMonthlySum += monthlyCents
        break
      case 'grace':
        graceCount++
        break
      case 'needs_setup':
        needsSetupCount++
        break
      case 'issues':
        issuesCount++
        break
      case 'org':
        orgCount++
        break
      case 'grandfathered':
        grandfatheredCount++
        break
    }
  }

  mrrCents = Math.round(mrrCents)
  const avgAmountCents = activeCount > 0 ? Math.round(mrrCents / activeCount) : 0
  const avgTrialAmountCents = trialCount > 0 ? Math.round(trialMonthlySum / trialCount) : avgAmountCents
  const projectedMrrCents = mrrCents + trialCount * avgTrialAmountCents

  activeSubscribers.sort((a, b) => b.monthlyCents - a.monthlyCents)

  return NextResponse.json({
    mrrCents,
    arrCents: mrrCents * 12,
    projectedMrrCents,
    projectedArrCents: projectedMrrCents * 12,
    activeCount,
    trialCount,
    graceCount,
    needsSetupCount,
    issuesCount,
    orgCount,
    grandfatheredCount,
    totalUsers: allUsers.length,
    avgAmountCents,
    avgTrialAmountCents,
    buckets,
    activeSubscribers,
  })
}
