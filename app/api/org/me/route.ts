import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationMembers, organizations, organizationGroups } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return Response.json(null)

  const [membership] = await db
    .select({
      orgId: organizationMembers.organizationId,
      orgName: organizations.name,
      orgPrivacyLevel: organizations.privacyLevel,
      groupId: organizationMembers.groupId,
      groupName: organizationGroups.name,
      groupPrivacyLevel: organizationGroups.privacyLevel,
      role: organizationMembers.role,
      roleScope: organizationMembers.roleScope,
      status: organizationMembers.status,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .leftJoin(organizationGroups, eq(organizationGroups.id, organizationMembers.groupId))
    .where(eq(organizationMembers.userEmail, session.user.email))
    .limit(1)

  return Response.json(membership ?? null)
}
