import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures, deletedAccounts } from '@/lib/schema'
import { removeTrackingData } from '@/lib/accountData'
import { stripe } from '@/lib/stripe'
import { pauseBillingForSuspension, resumeBillingAfterSuspension } from '@/lib/suspensionBilling'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json()

  if (!['suspend', 'unsuspend', 'grant_trial', 'set_profile_public', 'set_profile_private'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const [target] = await db
    .select({ email: users.email, stripeSubscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.id, id))
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'grant_trial') {
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const [updated] = await db
      .update(users)
      .set({ trialEndsAt })
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, trialEndsAt: users.trialEndsAt })
    return NextResponse.json(updated)
  }

  if (action === 'set_profile_public' || action === 'set_profile_private') {
    const [updated] = await db
      .update(users)
      .set({ profileVisible: action === 'set_profile_public' })
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, profileVisible: users.profileVisible })
    return NextResponse.json(updated)
  }

  if (action === 'suspend') {
    if (target.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })
    }
    await db.delete(adventures).where(eq(adventures.userEmail, target.email))
  }

  const [updated] = await db
    .update(users)
    .set({ status: action === 'suspend' ? 'suspended' : 'active' })
    .where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, status: users.status })

  // A suspended user can't use the account, so they shouldn't be charged for it. A Stripe
  // failure doesn't undo the suspension, but the admin is told so they can sort out billing.
  if (target.stripeSubscriptionId) {
    try {
      if (action === 'suspend') await pauseBillingForSuspension(target.stripeSubscriptionId)
      else await resumeBillingAfterSuspension(target.stripeSubscriptionId)
    } catch (err) {
      console.error(`Stripe ${action} billing update failed for subscription ${target.stripeSubscriptionId}:`, err)
      return NextResponse.json({ ...updated, stripeUpdateFailed: true, stripeSubscriptionId: target.stripeSubscriptionId })
    }
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const [target] = await db
    .select({
      email: users.email,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      trialEndsAt: users.trialEndsAt,
      grandfathered: users.grandfathered,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.email === session.user.email) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const trialUsed = !!target.trialEndsAt
  const hadPaidSubscription = target.grandfathered ||
    (['active', 'past_due', 'paused', 'canceled'].includes(target.subscriptionStatus ?? '') &&
    !!target.stripeSubscriptionId)
  await db.insert(deletedAccounts)
    .values({ email: target.email, trialUsed, hadPaidSubscription: !!hadPaidSubscription, reason: 'admin_deleted', signedUpAt: target.createdAt })
    .onConflictDoUpdate({
      target: deletedAccounts.email,
      set: { deletedAt: new Date(), trialUsed, hadPaidSubscription: !!hadPaidSubscription, reason: 'admin_deleted', signedUpAt: target.createdAt },
    })

  await removeTrackingData(target.email)
  await db.delete(adventures).where(eq(adventures.userEmail, target.email))
  await db.delete(users).where(eq(users.id, id))

  // Cancel last: the webhook this triggers must find no user, so it can't log their email or send a cancellation email
  if (target.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(target.stripeSubscriptionId)
    } catch (err) {
      // The account is already gone, so tell the admin: this person may still be getting charged
      console.error(`Stripe cancel failed for subscription ${target.stripeSubscriptionId}:`, err)
      return NextResponse.json({ success: true, stripeCancelFailed: true, stripeSubscriptionId: target.stripeSubscriptionId })
    }
  }

  return NextResponse.json({ success: true })
}
