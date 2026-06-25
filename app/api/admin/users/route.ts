import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [allUsers, storyCounts] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        tier: users.tier,
        status: users.status,
        createdAt: users.createdAt,
        grandfathered: users.grandfathered,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionAmountCents: users.subscriptionAmountCents,
        trialEndsAt: users.trialEndsAt,
        gracePeriodEndsAt: users.gracePeriodEndsAt,
        stripeCustomerId: users.stripeCustomerId,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select({ userEmail: adventures.userEmail, count: sql<number>`count(*)::int` })
      .from(adventures)
      .groupBy(adventures.userEmail),
  ])

  const countMap = new Map(storyCounts.map(r => [r.userEmail, r.count]))

  return NextResponse.json(
    allUsers.map(u => ({ ...u, storyCount: countMap.get(u.email) ?? 0 }))
  )
}
