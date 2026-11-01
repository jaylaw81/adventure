import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users, friendInvites } from '@/lib/schema'
import { sendCheckoutReminderEmail, sendPaymentFailedEmail, sendCancellationEmail } from '@/lib/email'

const CHECKOUT_REMINDER_COOLDOWN_MS = 30 * 86_400_000

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

        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price'],
        })
        const amountCents = subscription.items.data[0]?.price?.unit_amount ?? null
        const interval = (subscription.items.data[0]?.price?.recurring?.interval ?? null) as 'day' | 'week' | 'month' | 'year' | null

        // Fetch user to check invite state and pending reward weeks
        const [user] = await db
          .select({
            invitedByToken: users.invitedByToken,
            pendingFriendRewardWeeks: users.pendingFriendRewardWeeks,
          })
          .from(users)
          .where(eq(users.email, email))

        // Clear pending reward weeks that were applied as trial days in this checkout
        const pendingWeeksUsed = parseInt(session.metadata?.pendingFriendRewardWeeks ?? '0')

        await db.update(users)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            subscriptionAmountCents: amountCents,
            subscriptionInterval: interval,
            // Paying ends any free trial immediately
            trialEndsAt: new Date(),
            ...(pendingWeeksUsed > 0
              ? { pendingFriendRewardWeeks: sql`GREATEST(0, pending_friend_reward_weeks - ${pendingWeeksUsed})` }
              : {}),
          })
          .where(eq(users.email, email))

        // Banked friend-reward weeks become a balance credit (same value as rewardInviter
        // gives active subscribers) rather than free trial time
        if (pendingWeeksUsed > 0 && amountCents) {
          await stripe.customers.createBalanceTransaction(customerId, {
            amount: -(amountCents * pendingWeeksUsed),
            currency: 'usd',
            description: `Friend invite rewards — ${pendingWeeksUsed} free week${pendingWeeksUsed > 1 ? 's' : ''}`,
          })
        }

        // If this new subscriber came from a friend invite, reward the inviter
        if (user?.invitedByToken) {
          await rewardInviter(user.invitedByToken, email, amountCents)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        let status: string = subscription.status
        if (subscription.pause_collection) status = 'paused'

        const amountCents = subscription.items.data[0]?.price?.unit_amount ?? null
        const interval = (subscription.items.data[0]?.price?.recurring?.interval ?? null) as 'day' | 'week' | 'month' | 'year' | null

        await db.update(users)
          .set({
            subscriptionStatus: status,
            subscriptionAmountCents: amountCents,
            subscriptionInterval: interval,
            stripeSubscriptionId: subscription.id,
          })
          .where(eq(users.stripeCustomerId, customerId))
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const [user] = await db
          .select({
            email: users.email,
            displayName: users.displayName,
            subscriptionStatus: users.subscriptionStatus,
            emailSubscribed: users.emailSubscribed,
            unsubscribeToken: users.unsubscribeToken,
          })
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))

        await db.update(users)
          .set({ subscriptionStatus: 'canceled', stripeSubscriptionId: null })
          .where(eq(users.stripeCustomerId, customerId))

        // Skip on webhook retries (already canceled) and for people who opted out of email
        if (user && user.subscriptionStatus !== 'canceled' && user.emailSubscribed) {
          await sendCancellationEmail({
            to: user.email,
            displayName: user.displayName || null,
            unsubscribeToken: user.unsubscribeToken,
          }).catch(err => console.error('Cancellation email failed:', err))
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await db.update(users)
          .set({ subscriptionStatus: 'past_due' })
          .where(eq(users.stripeCustomerId, customerId))

        // Stripe retries failed renewals; only email on the first attempt
        if (invoice.attempt_count === 1 && invoice.billing_reason === 'subscription_cycle') {
          const [user] = await db
            .select({ email: users.email, displayName: users.displayName })
            .from(users)
            .where(eq(users.stripeCustomerId, customerId))
          if (user) {
            await sendPaymentFailedEmail({ to: user.email, displayName: user.displayName || null })
              .catch(err => console.error('Payment failed email failed:', err))
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.metadata?.email
        if (!email || session.mode !== 'subscription') break

        const [user] = await db
          .select({
            displayName: users.displayName,
            subscriptionStatus: users.subscriptionStatus,
            emailSubscribed: users.emailSubscribed,
            unsubscribeToken: users.unsubscribeToken,
            checkoutReminderSentAt: users.checkoutReminderSentAt,
          })
          .from(users)
          .where(eq(users.email, email))

        if (!user || !user.emailSubscribed) break
        if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') break
        if (user.checkoutReminderSentAt && Date.now() - user.checkoutReminderSentAt.getTime() < CHECKOUT_REMINDER_COOLDOWN_MS) break

        await sendCheckoutReminderEmail({
          to: email,
          displayName: user.displayName || null,
          interval: session.metadata?.interval ?? null,
          unsubscribeToken: user.unsubscribeToken,
        })
        await db.update(users).set({ checkoutReminderSentAt: new Date() }).where(eq(users.email, email))
        break
      }
    }
  } catch {
    console.error('Webhook handler error for event', event.type)
  }

  return NextResponse.json({ ok: true })
}

async function rewardInviter(inviteToken: string, inviteeEmail: string, inviteeAmountCents: number | null) {
  const [invite] = await db
    .select()
    .from(friendInvites)
    .where(eq(friendInvites.token, inviteToken))

  if (!invite || invite.status === 'rewarded') return

  const [inviter] = await db
    .select({
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionAmountCents: users.subscriptionAmountCents,
    })
    .from(users)
    .where(eq(users.email, invite.inviterEmail))

  if (!inviter) return

  const now = new Date()

  if (inviter.stripeCustomerId && inviter.stripeSubscriptionId && inviter.subscriptionStatus === 'active') {
    // Apply a Stripe customer balance credit equal to one week's subscription amount
    const creditAmount = inviter.subscriptionAmountCents ?? inviteeAmountCents ?? 200
    await stripe.customers.createBalanceTransaction(inviter.stripeCustomerId, {
      amount: -creditAmount, // negative = credit to customer
      currency: 'usd',
      description: `Friend invite reward — 1 free week (${inviteeEmail} subscribed)`,
    })
  } else {
    // Inviter not yet subscribed — bank the reward week for when they subscribe
    await db.update(users)
      .set({ pendingFriendRewardWeeks: sql`pending_friend_reward_weeks + 1` })
      .where(eq(users.email, invite.inviterEmail))
  }

  await db.update(friendInvites)
    .set({ status: 'rewarded', subscribedAt: now, rewardedAt: now })
    .where(eq(friendInvites.token, inviteToken))
}
