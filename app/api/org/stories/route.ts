import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationMembers, adventures, nodes } from '@/lib/schema'
import { eq, inArray, sql } from 'drizzle-orm'

export async function GET() {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const members = await db
    .select({ userEmail: organizationMembers.userEmail })
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, ctx.org.id))

  if (members.length === 0) return Response.json([])

  const memberEmails = members.map(m => m.userEmail)

  const stories = await db
    .select({
      id: adventures.id,
      title: adventures.title,
      description: adventures.description,
      userEmail: adventures.userEmail,
      isPublic: adventures.isPublic,
      audience: adventures.audience,
      createdAt: adventures.createdAt,
      updatedAt: adventures.updatedAt,
      sceneCount: sql<number>`(
        select count(*) from ${nodes} where ${nodes.adventureId} = ${adventures.id}
      )`.mapWith(Number),
    })
    .from(adventures)
    .where(inArray(adventures.userEmail, memberEmails))
    .orderBy(adventures.createdAt)

  return Response.json(stories)
}
