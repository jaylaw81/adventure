import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { isOrgUser } from '@/lib/subscription'
import SubscribeForm from './SubscribeForm'

export default async function SubscribePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/sign-in?next=/subscribe')

  const orgUser = await isOrgUser(session.user.email)
  if (orgUser) redirect('/profile')

  const [user] = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      trialEndsAt: users.trialEndsAt,
      gracePeriodEndsAt: users.gracePeriodEndsAt,
      pendingFriendRewardWeeks: users.pendingFriendRewardWeeks,
    })
    .from(users)
    .where(eq(users.email, session.user.email))

  if (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing') {
    redirect('/profile')
  }

  return (
    <SubscribeForm
      trialEndsAt={user?.trialEndsAt?.toISOString() ?? null}
      gracePeriodEndsAt={user?.gracePeriodEndsAt?.toISOString() ?? null}
      pendingFriendRewardWeeks={user?.pendingFriendRewardWeeks ?? 0}
    />
  )
}
