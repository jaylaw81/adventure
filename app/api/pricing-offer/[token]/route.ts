import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, priceReductionOffers } from '@/lib/schema'
import { stripe } from '@/lib/stripe'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params

  const [offer] = await db
    .select()
    .from(priceReductionOffers)
    .where(
      and(
        eq(priceReductionOffers.token, token),
        eq(priceReductionOffers.userEmail, session.user.email),
      )
    )
    .limit(1)

  if (!offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
  }
  if (offer.status === 'accepted') {
    return NextResponse.json({ error: 'Offer already accepted' }, { status: 409 })
  }
  if (offer.status === 'expired' || offer.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Offer has expired' }, { status: 410 })
  }

  const [user] = await db
    .select({
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!user?.stripeSubscriptionId || user.subscriptionStatus !== 'active') {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }

  // Update the Stripe subscription to the new price
  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
  const itemId = subscription.items.data[0]?.id
  if (!itemId) {
    return NextResponse.json({ error: 'Subscription item not found' }, { status: 500 })
  }

  const newPrice = await stripe.prices.create({
    unit_amount: offer.offeredAmountCents,
    currency: 'usd',
    recurring: { interval: 'week' },
    product_data: { name: 'StoryQuestor Subscription' },
  })

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{ id: itemId, price: newPrice.id }],
    proration_behavior: 'none',
  })

  // Mark offer accepted + update local DB immediately (webhook will confirm)
  await db
    .update(priceReductionOffers)
    .set({ status: 'accepted', acceptedAt: new Date() })
    .where(eq(priceReductionOffers.id, offer.id))

  await db
    .update(users)
    .set({ subscriptionAmountCents: offer.offeredAmountCents })
    .where(eq(users.email, session.user.email))

  return NextResponse.json({ ok: true })
}
