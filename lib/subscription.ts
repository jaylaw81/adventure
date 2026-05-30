import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

export async function canCreateStories(email: string): Promise<boolean> {
  const [user] = await db
    .select({
      tier: users.tier,
      grandfathered: users.grandfathered,
      subscriptionStatus: users.subscriptionStatus,
      trialEndsAt: users.trialEndsAt,
      gracePeriodEndsAt: users.gracePeriodEndsAt,
    })
    .from(users)
    .where(eq(users.email, email))

  if (!user) return false
  if (user.grandfathered) return true
  if (user.tier === 'organization') return true
  if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') return true
  if (user.trialEndsAt && user.trialEndsAt > new Date()) return true
  if (user.gracePeriodEndsAt && user.gracePeriodEndsAt > new Date()) return true
  return false
}
