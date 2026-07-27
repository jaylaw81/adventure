import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, organizations, organizationMembers } from '@/lib/schema'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jaylaw81@gmail.com'

/** True if the user is an org admin or member — their access is covered by the organization. */
export async function isOrgUser(email: string): Promise<boolean> {
  const [orgAdmin] = await db
    .select({ adminEmail: organizations.adminEmail })
    .from(organizations)
    .where(eq(organizations.adminEmail, email))
    .limit(1)
  if (orgAdmin) return true

  const [orgMember] = await db
    .select({ userEmail: organizationMembers.userEmail })
    .from(organizationMembers)
    .where(eq(organizationMembers.userEmail, email))
    .limit(1)
  return !!orgMember
}

/** True if the user can use AI image generation and scene sounds (monthly plan or org/grandfathered). */
export async function canGenerateImages(email: string): Promise<boolean> {
  if (email === ADMIN_EMAIL) return true
  const [user] = await db
    .select({
      tier: users.tier,
      grandfathered: users.grandfathered,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionInterval: users.subscriptionInterval,
    })
    .from(users)
    .where(eq(users.email, email))

  if (!user) return false
  if (user.grandfathered) return true
  if (user.tier === 'organization') return true
  if (await isOrgUser(email)) return true
  return (
    (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') &&
    user.subscriptionInterval === 'month'
  )
}

/**
 * True if the user can make a story private (set isPublic = false).
 * Trial users are explicitly excluded — private stories are a paid-subscriber benefit.
 */
export async function canHavePrivateStories(email: string): Promise<boolean> {
  if (email === ADMIN_EMAIL) return true
  const [user] = await db
    .select({
      tier: users.tier,
      grandfathered: users.grandfathered,
      subscriptionStatus: users.subscriptionStatus,
    })
    .from(users)
    .where(eq(users.email, email))

  if (!user) return false
  if (user.grandfathered) return true
  if (user.tier === 'organization') return true
  if (user.subscriptionStatus === 'active') return true
  if (await isOrgUser(email)) return true
  return false
}

export async function canCreateStories(email: string): Promise<boolean> {
  if (email === ADMIN_EMAIL) return true
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
  if (await isOrgUser(email)) return true
  return false
}
