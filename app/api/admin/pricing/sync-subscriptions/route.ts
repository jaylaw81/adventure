import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, isNull, or } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { stripe } from '@/lib/stripe'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.isAdmin ? session : null
}

export async function POST() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find active subscribers whose interval is null or unknown (stale pre-interval-tracking data)
  const staleUsers = await db
    .select({
      email: users.email,
      stripeSubscriptionId: users.stripeSubscriptionId,
    })
    .from(users)
    .where(
      or(
        eq(users.subscriptionStatus, 'active'),
        eq(users.subscriptionStatus, 'trialing'),
      )
    )

  let synced = 0
  let skipped = 0
  const errors: string[] = []

  for (const u of staleUsers) {
    if (!u.stripeSubscriptionId) { skipped++; continue }

    try {
      const subscription = await stripe.subscriptions.retrieve(u.stripeSubscriptionId, {
        expand: ['items.data.price'],
      })

      const amountCents = subscription.items.data[0]?.price?.unit_amount ?? null
      const interval = (subscription.items.data[0]?.price?.recurring?.interval ?? null) as 'day' | 'week' | 'month' | null
      const status = subscription.pause_collection ? 'paused' : subscription.status

      await db
        .update(users)
        .set({
          subscriptionAmountCents: amountCents,
          subscriptionInterval: interval,
          subscriptionStatus: status,
        })
        .where(eq(users.email, u.email))

      synced++
    } catch (err) {
      errors.push(`${u.email}: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  return NextResponse.json({ synced, skipped, errors })
}
