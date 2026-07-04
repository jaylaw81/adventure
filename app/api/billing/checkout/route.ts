import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { stripe, SITE_URL } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amountCents } = await req.json()
    if (!amountCents || typeof amountCents !== 'number' || amountCents < 200) {
      return NextResponse.json({ error: 'Minimum amount is $2.00' }, { status: 400 })
    }

    const email = session.user.email
    const [user] = await db
      .select({
        stripeCustomerId: users.stripeCustomerId,
        pendingFriendRewardWeeks: users.pendingFriendRewardWeeks,
      })
      .from(users)
      .where(eq(users.email, email))

    const pendingWeeks = user?.pendingFriendRewardWeeks ?? 0
    const trialDays = pendingWeeks * 7

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ...(user?.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: email }),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'week' },
            unit_amount: amountCents,
            product_data: { name: 'StoryQuestor Subscription' },
          },
          quantity: 1,
        },
      ],
      ...(trialDays > 0 ? { subscription_data: { trial_period_days: trialDays } } : {}),
      metadata: {
        email,
        pendingFriendRewardWeeks: String(pendingWeeks),
      },
      success_url: `${SITE_URL}/?subscribed=1`,
      cancel_url: `${SITE_URL}/subscribe`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
