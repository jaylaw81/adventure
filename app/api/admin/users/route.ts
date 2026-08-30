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
        subscriptionInterval: users.subscriptionInterval,
        profileVisible: users.profileVisible,
        trialEndsAt: users.trialEndsAt,
        gracePeriodEndsAt: users.gracePeriodEndsAt,
        stripeCustomerId: users.stripeCustomerId,
        lastLoginAt: users.lastLoginAt,
        signupIp: users.signupIp,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select({ userEmail: adventures.userEmail, count: sql<number>`count(*)::int` })
      .from(adventures)
      .groupBy(adventures.userEmail),
  ])

  const countMap = new Map(storyCounts.map(r => [r.userEmail, r.count]))

  // How many accounts (including this one) share this signup IP — a soft
  // trial-abuse signal, not proof; shared wifi/offices/mobile NAT produce it too.
  const ipCounts = new Map<string, number>()
  for (const u of allUsers) {
    if (u.signupIp) ipCounts.set(u.signupIp, (ipCounts.get(u.signupIp) ?? 0) + 1)
  }

  return NextResponse.json(
    allUsers.map(u => ({
      ...u,
      storyCount: countMap.get(u.email) ?? 0,
      sharedIpCount: u.signupIp ? ipCounts.get(u.signupIp)! : 0,
    }))
  )
}
