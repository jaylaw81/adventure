import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.metadata?.email
        if (!email || session.mode !== 'subscription') break

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        // Fetch the subscription to get the price amount
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price'],
        })
        const amountCents = subscription.items.data[0]?.price?.unit_amount ?? null

        await db.update(users)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            subscriptionAmountCents: amountCents,
          })
          .where(eq(users.email, email))
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Derive status: if pause_collection is set, treat as paused
        let status: string = subscription.status
        if (subscription.pause_collection) status = 'paused'

        const amountCents = subscription.items.data[0]?.price?.unit_amount ?? null

        await db.update(users)
          .set({
            subscriptionStatus: status,
            subscriptionAmountCents: amountCents,
            stripeSubscriptionId: subscription.id,
          })
          .where(eq(users.stripeCustomerId, customerId))
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await db.update(users)
          .set({ subscriptionStatus: 'canceled', stripeSubscriptionId: null })
          .where(eq(users.stripeCustomerId, customerId))
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await db.update(users)
          .set({ subscriptionStatus: 'past_due' })
          .where(eq(users.stripeCustomerId, customerId))
        break
      }
    }
  } catch {
    // Log but don't re-throw — always return 200 so Stripe doesn't retry
    console.error('Webhook handler error for event', event.type)
  }

  return NextResponse.json({ ok: true })
}
