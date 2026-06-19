import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationMembers, users, adventures, memberGroups, organizationGroups } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET() {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const [members, groupAssignments] = await Promise.all([
    db
      .select({
        id: organizationMembers.id,
        userEmail: organizationMembers.userEmail,
        role: organizationMembers.role,
        roleScope: organizationMembers.roleScope,
        status: organizationMembers.status,
        consentStatus: organizationMembers.consentStatus,
        consentedAt: organizationMembers.consentedAt,
        joinedAt: organizationMembers.joinedAt,
        displayName: users.displayName,
        storyCount: sql<number>`(
          select count(*) from ${adventures}
          where ${adventures.userEmail} = ${organizationMembers.userEmail}
        )`.mapWith(Number),
      })
      .from(organizationMembers)
      .leftJoin(users, eq(users.email, organizationMembers.userEmail))
      .where(eq(organizationMembers.organizationId, ctx.org.id))
      .orderBy(organizationMembers.joinedAt),

    db
      .select({
        userEmail: memberGroups.userEmail,
        groupId: memberGroups.groupId,
        groupName: organizationGroups.name,
      })
      .from(memberGroups)
      .innerJoin(organizationGroups, eq(organizationGroups.id, memberGroups.groupId))
      .where(eq(memberGroups.organizationId, ctx.org.id)),
  ])

  // Build email → groups map
  const groupsByEmail: Record<string, { id: string; name: string }[]> = {}
  for (const ga of groupAssignments) {
    if (!groupsByEmail[ga.userEmail]) groupsByEmail[ga.userEmail] = []
    groupsByEmail[ga.userEmail].push({ id: ga.groupId, name: ga.groupName! })
  }

  return Response.json({
    members: members.map(m => ({ ...m, groups: groupsByEmail[m.userEmail] ?? [] })),
    consentFormEnabled: ctx.org.consentFormEnabled,
  })
}
