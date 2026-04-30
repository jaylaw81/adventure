import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationMembers, organizationInvites } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const [members, invites] = await Promise.all([
    db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, ctx.org.id)),
    db.select().from(organizationInvites).where(
      and(eq(organizationInvites.organizationId, ctx.org.id), eq(organizationInvites.status, 'pending'))
    ),
  ])

  return Response.json({ org: ctx.org, memberCount: members.length, pendingInvites: invites.length })
}
