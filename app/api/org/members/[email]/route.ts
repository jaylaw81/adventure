import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationMembers, organizationGroups } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

const VALID_ROLES = ['member', 'teacher', 'reviewer'] as const
const VALID_SCOPES = ['org', 'groups'] as const

function isOrgGroupId(groupId: unknown): groupId is string | null {
  return groupId === null || typeof groupId === 'string'
}

export async function PATCH(req: Request, { params }: { params: Promise<{ email: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { email } = await params
  const targetEmail = decodeURIComponent(email)

  if (targetEmail === ctx.session.user.email) {
    return Response.json({ error: 'Cannot modify the organization admin' }, { status: 400 })
  }

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { status, groupId, role, roleScope, resetConsent } = body as Record<string, unknown>
  const updates: Record<string, unknown> = {}

  if (resetConsent === true) {
    updates.consentStatus = 'pending'
  }

  if (status !== undefined) {
    if (status !== 'active' && status !== 'inactive') {
      return Response.json({ error: 'status must be "active" or "inactive"' }, { status: 400 })
    }
    updates.status = status
  }

  if (role !== undefined) {
    if (!(VALID_ROLES as readonly string[]).includes(role as string)) {
      return Response.json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` }, { status: 400 })
    }
    updates.role = role
    // When demoting to plain member, reset scope to org
    if (role === 'member') updates.roleScope = 'org'
  }

  if (roleScope !== undefined) {
    if (!(VALID_SCOPES as readonly string[]).includes(roleScope as string)) {
      return Response.json({ error: 'roleScope must be "org" or "groups"' }, { status: 400 })
    }
    updates.roleScope = roleScope
  }

  if (groupId !== undefined) {
    if (!isOrgGroupId(groupId)) return Response.json({ error: 'Invalid groupId' }, { status: 400 })
    if (groupId !== null) {
      const [grp] = await db
        .select({ id: organizationGroups.id })
        .from(organizationGroups)
        .where(and(eq(organizationGroups.id, groupId as string), eq(organizationGroups.organizationId, ctx.org.id)))
        .limit(1)
      if (!grp) return Response.json({ error: 'Group not found in your organization' }, { status: 404 })
    }
    updates.groupId = groupId
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const [updated] = await db
    .update(organizationMembers)
    .set(updates)
    .where(and(
      eq(organizationMembers.organizationId, ctx.org.id),
      eq(organizationMembers.userEmail, targetEmail),
    ))
    .returning()

  if (!updated) return Response.json({ error: 'Member not found' }, { status: 404 })
  return Response.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ email: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { email } = await params
  const targetEmail = decodeURIComponent(email)

  if (targetEmail === ctx.session.user.email) {
    return Response.json({ error: 'Cannot remove the organization admin' }, { status: 400 })
  }

  await db
    .delete(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, ctx.org.id),
      eq(organizationMembers.userEmail, targetEmail),
    ))

  return Response.json({ ok: true })
}
