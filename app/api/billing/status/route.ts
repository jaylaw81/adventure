import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { canCreateStories } from '@/lib/subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = session.user.email
    const [user] = await db
      .select({
        tier: users.tier,
        grandfathered: users.grandfathered,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionAmountCents: users.subscriptionAmountCents,
        stripeCustomerId: users.stripeCustomerId,
        trialEndsAt: users.trialEndsAt,
        gracePeriodEndsAt: users.gracePeriodEndsAt,
      })
      .from(users)
      .where(eq(users.email, email))

    const canCreate = await canCreateStories(email)

    return NextResponse.json({
      tier: user?.tier ?? 'free',
      grandfathered: user?.grandfathered ?? false,
      subscriptionStatus: user?.subscriptionStatus ?? null,
      subscriptionAmountCents: user?.subscriptionAmountCents ?? null,
      hasStripeAccount: !!user?.stripeCustomerId,
      trialEndsAt: user?.trialEndsAt ?? null,
      gracePeriodEndsAt: user?.gracePeriodEndsAt ?? null,
      canCreate,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch billing status' }, { status: 500 })
  }
}
