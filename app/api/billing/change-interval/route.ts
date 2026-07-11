import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { stripe } from '@/lib/stripe'
import { getPricingConfig, getIntervalConfig, type BillingInterval } from '@/lib/pricing'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { interval: rawInterval } = await req.json()
  const interval = rawInterval as BillingInterval

  if (!['day', 'week', 'month'].includes(interval)) {
    return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
  }

  const pricing = await getPricingConfig()
  const ic = getIntervalConfig(pricing, interval)
  if (!ic?.enabled) {
    return NextResponse.json({ error: `${interval} billing is not currently available` }, { status: 400 })
  }

  const [user] = await db
    .select({
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionInterval: users.subscriptionInterval,
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }
  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
    return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 })
  }
  if (user.subscriptionInterval === interval) {
    return NextResponse.json({ error: 'Already on this billing interval' }, { status: 400 })
  }

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
  const itemId = subscription.items.data[0]?.id
  if (!itemId) {
    return NextResponse.json({ error: 'Subscription item not found' }, { status: 500 })
  }

  const newPrice = await stripe.prices.create({
    unit_amount: ic.priceCents,
    currency: 'usd',
    recurring: { interval },
    product_data: { name: 'StoryQuestor Subscription' },
  })

  // Interval changes always reset the billing period — no proration issued
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{ id: itemId, price: newPrice.id }],
    proration_behavior: 'none',
  })

  await db
    .update(users)
    .set({
      subscriptionInterval: interval,
      subscriptionAmountCents: ic.priceCents,
    })
    .where(eq(users.email, session.user.email))

  return NextResponse.json({ ok: true, interval, priceCents: ic.priceCents })
}
