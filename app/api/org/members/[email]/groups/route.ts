import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { memberGroups, organizationGroups } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ email: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { email } = await params
  const targetEmail = decodeURIComponent(email)

  const rows = await db
    .select({ groupId: memberGroups.groupId })
    .from(memberGroups)
    .where(and(
      eq(memberGroups.organizationId, ctx.org.id),
      eq(memberGroups.userEmail, targetEmail),
    ))

  return Response.json(rows.map(r => r.groupId))
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

  if (groupIds.length > 0) {
    const valid = await db
      .select({ id: organizationGroups.id })
      .from(organizationGroups)
      .where(and(
        eq(organizationGroups.organizationId, ctx.org.id),
        inArray(organizationGroups.id, groupIds),
      ))
    if (valid.length !== groupIds.length) {
      return Response.json({ error: 'One or more groups not found' }, { status: 400 })
    }
  }

  await db
    .delete(memberGroups)
    .where(and(
      eq(memberGroups.organizationId, ctx.org.id),
      eq(memberGroups.userEmail, targetEmail),
    ))

  if (groupIds.length > 0) {
    await db.insert(memberGroups).values(
      groupIds.map(groupId => ({
        organizationId: ctx.org.id,
        userEmail: targetEmail,
        groupId,
      }))
    )
  }

  return Response.json({ ok: true, groupIds })
}
