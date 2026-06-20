import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures, deletedAccounts } from '@/lib/schema'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json()

  if (!['suspend', 'unsuspend', 'grant_trial'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, id))
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
    .values({ email: target.email, trialUsed, hadPaidSubscription: !!hadPaidSubscription, reason: 'admin_deleted' })
    .onConflictDoUpdate({
      target: deletedAccounts.email,
      set: { deletedAt: new Date(), trialUsed, hadPaidSubscription: !!hadPaidSubscription, reason: 'admin_deleted' },
    })

  await db.delete(adventures).where(eq(adventures.userEmail, target.email))
  await db.delete(users).where(eq(users.id, id))
  return NextResponse.json({ success: true })
}
