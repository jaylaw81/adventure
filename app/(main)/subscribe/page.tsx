import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { isOrgUser } from '@/lib/subscription'
import { getPricingConfig } from '@/lib/pricing'
import SubscribeForm from './SubscribeForm'

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function SubscribePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const params = await searchParams
  if (!session?.user?.email) {
    const iv = params.interval
    const nextUrl = iv ? `/subscribe?interval=${iv}` : '/subscribe'
    redirect(`/sign-in?next=${encodeURIComponent(nextUrl)}`)
  }

  const orgUser = await isOrgUser(session.user.email)
  if (orgUser) redirect('/profile')

  const onboarding = params.onboarding === '1'
  const intervalParam = params.interval ?? ''

  const [[user], pricing] = await Promise.all([
    db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        trialEndsAt: users.trialEndsAt,
        gracePeriodEndsAt: users.gracePeriodEndsAt,
        pendingFriendRewardWeeks: users.pendingFriendRewardWeeks,
      })
      .from(users)
      .where(eq(users.email, session.user.email)),
    getPricingConfig(),
  ])

  if (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing') {
    redirect(onboarding ? '/' : '/profile')
  }

  return (
    <SubscribeForm
      trialEndsAt={user?.trialEndsAt?.toISOString() ?? null}
      gracePeriodEndsAt={user?.gracePeriodEndsAt?.toISOString() ?? null}
      pendingFriendRewardWeeks={user?.pendingFriendRewardWeeks ?? 0}
      onboarding={onboarding}
      pricing={pricing}
      initialInterval={intervalParam || undefined}
    />
  )
}
