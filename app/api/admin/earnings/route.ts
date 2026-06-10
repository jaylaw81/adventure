import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

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

  function classify(u: typeof allUsers[0]): { category: Category; amountCents: number } {
    const amt = u.subscriptionAmountCents ?? 0
    if (u.tier === 'organization') return { category: 'org', amountCents: 0 }
    if (u.grandfathered) return { category: 'grandfathered', amountCents: 0 }
    if (u.subscriptionStatus === 'active') return { category: 'active', amountCents: amt }
    const trialDays = daysLeft(u.trialEndsAt)
    if (u.subscriptionStatus === 'trialing' || trialDays !== null) return { category: 'trial', amountCents: amt }
    if (daysLeft(u.gracePeriodEndsAt) !== null) return { category: 'grace', amountCents: amt }
    if (u.subscriptionStatus === 'past_due') return { category: 'issues', amountCents: amt }
    if (u.subscriptionStatus === 'canceled' || u.subscriptionStatus === 'paused') return { category: 'issues', amountCents: 0 }
    return { category: 'needs_setup', amountCents: 0 }
  }

  // MRR from active subscribers only
  let mrrCents = 0
  let activeCount = 0
  let trialCount = 0
  let trialAmountSum = 0
  let graceCount = 0
  let needsSetupCount = 0
  let issuesCount = 0
  let orgCount = 0
  let grandfatheredCount = 0

  // Revenue buckets: $2, $3-$4, $5, $6-$9, $10, $11-$19, $20+
  const buckets: Record<string, number> = {
    '$2': 0, '$3–$4': 0, '$5': 0, '$6–$9': 0, '$10': 0, '$11–$19': 0, '$20+': 0,
  }

  const activeSubscribers: { email: string; displayName: string; amountCents: number; status: string }[] = []

  for (const u of allUsers) {
    const { category, amountCents } = classify(u)
    switch (category) {
      case 'active':
        mrrCents += amountCents
        activeCount++
        activeSubscribers.push({
          email: u.email,
          displayName: u.displayName,
          amountCents,
          status: 'active',
        })
        // Bucket
        if (amountCents <= 200) buckets['$2']++
        else if (amountCents <= 400) buckets['$3–$4']++
        else if (amountCents <= 500) buckets['$5']++
        else if (amountCents <= 900) buckets['$6–$9']++
        else if (amountCents <= 1000) buckets['$10']++
        else if (amountCents <= 1900) buckets['$11–$19']++
        else buckets['$20+']++
        break
      case 'trial':
        trialCount++
        trialAmountSum += amountCents
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

  const avgAmountCents = activeCount > 0 ? Math.round(mrrCents / activeCount) : 0
  const avgTrialAmountCents = trialCount > 0 ? Math.round(trialAmountSum / trialCount) : avgAmountCents
  const projectedMrrCents = mrrCents + trialCount * avgTrialAmountCents

  activeSubscribers.sort((a, b) => b.amountCents - a.amountCents)

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
