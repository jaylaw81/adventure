import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { memberGroupPermissions, organizationGroups } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ email: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { email } = await params
  const targetEmail = decodeURIComponent(email)

  const perms = await db
    .select({ groupId: memberGroupPermissions.groupId })
    .from(memberGroupPermissions)
    .where(and(
      eq(memberGroupPermissions.organizationId, ctx.org.id),
      eq(memberGroupPermissions.userEmail, targetEmail),
    ))

  return Response.json(perms.map(p => p.groupId))
}

export async function PUT(req: Request, { params }: { params: Promise<{ email: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { email } = await params
  const targetEmail = decodeURIComponent(email)

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { groupIds } = body as Record<string, unknown>
  if (!Array.isArray(groupIds) || !groupIds.every(id => typeof id === 'string')) {
    return Response.json({ error: 'groupIds must be an array of strings' }, { status: 400 })
  }

  // Verify all groupIds belong to this org
  if (groupIds.length > 0) {
    const validGroups = await db
      .select({ id: organizationGroups.id })
      .from(organizationGroups)
      .where(and(
        eq(organizationGroups.organizationId, ctx.org.id),
        inArray(organizationGroups.id, groupIds),
      ))
    if (validGroups.length !== groupIds.length) {
      return Response.json({ error: 'One or more groups not found in your organization' }, { status: 400 })
    }
  }

  // Replace all existing permissions for this user
  await db
    .delete(memberGroupPermissions)
    .where(and(
      eq(memberGroupPermissions.organizationId, ctx.org.id),
      eq(memberGroupPermissions.userEmail, targetEmail),
    ))

  if (groupIds.length > 0) {
    await db.insert(memberGroupPermissions).values(
      groupIds.map(groupId => ({
        organizationId: ctx.org.id,
        userEmail: targetEmail,
        groupId,
      }))
    )
  }

  return Response.json({ ok: true, groupIds })
}
