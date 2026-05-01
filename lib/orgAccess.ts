import { db } from '@/lib/db'
import { organizations, organizationMembers } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'

/**
 * Returns the org privacy level for a story author, or null if they are not an org member.
 * Used to decide whether sharing controls should be hidden on story pages.
 */
export async function getAuthorOrgPrivacy(authorEmail: string): Promise<string | null> {
  const [row] = await db
    .select({ privacyLevel: organizations.privacyLevel })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userEmail, authorEmail))
    .limit(1)
  return row?.privacyLevel ?? null
}

/**
 * Returns true if `viewerEmail` is allowed to view a private story owned by `authorEmail`
 * by virtue of their org relationship (admin of the same org, or teacher/reviewer in the same org).
 */
export async function canViewMemberStory(viewerEmail: string, authorEmail: string): Promise<boolean> {
  if (viewerEmail === authorEmail) return true

  // Case 1: viewer is the org admin and the author is a member of that org
  const adminAccess = await db
    .select({ orgId: organizations.id })
    .from(organizations)
    .innerJoin(organizationMembers, eq(organizationMembers.organizationId, organizations.id))
    .where(and(
      eq(organizations.adminEmail, viewerEmail),
      eq(organizationMembers.userEmail, authorEmail),
    ))
    .limit(1)

  if (adminAccess.length > 0) return true

  // Case 2: viewer is a teacher/reviewer member and is in the same org as the author
  const viewerMemberships = await db
    .select({ orgId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.userEmail, viewerEmail),
      eq(organizationMembers.status, 'active'),
      inArray(organizationMembers.role, ['teacher', 'reviewer']),
    ))

  if (viewerMemberships.length === 0) return false

  const viewerOrgIds = viewerMemberships.map(m => m.orgId)

  const authorInSameOrg = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(and(
      inArray(organizationMembers.organizationId, viewerOrgIds),
      eq(organizationMembers.userEmail, authorEmail),
    ))
    .limit(1)

  return authorInSameOrg.length > 0
}
