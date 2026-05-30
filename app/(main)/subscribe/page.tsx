import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import SubscribeForm from './SubscribeForm'

export default async function SubscribePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/sign-in?next=/subscribe')

  const [user] = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      stripeSubscriptionId: users.stripeSubscriptionId,
      trialEndsAt: users.trialEndsAt,
      gracePeriodEndsAt: users.gracePeriodEndsAt,
    })
    .from(users)
    .where(eq(users.email, session.user.email))

  // Already subscribed — send them to manage their plan
  if (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing') {
    redirect('/profile')
  }

  // hasTrial = new user who hasn't started a subscription yet (no stripeSubscriptionId)
  const hasTrial = !user?.stripeSubscriptionId

  return (
    <SubscribeForm
      hasTrial={hasTrial}
      trialEndsAt={user?.trialEndsAt?.toISOString() ?? null}
      gracePeriodEndsAt={user?.gracePeriodEndsAt?.toISOString() ?? null}
    />
  )
}
