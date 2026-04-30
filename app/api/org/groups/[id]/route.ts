import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationGroups } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

const VALID_PRIVACY = ['inherit', 'public', 'org-only', 'private'] as const

function sanitize(value: unknown, max = 200): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim().replace(/<[^>]*>/g, '').slice(0, max)
  return cleaned || null
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { name, description, privacyLevel } = body as Record<string, unknown>

  if (privacyLevel !== undefined && !(VALID_PRIVACY as readonly string[]).includes(privacyLevel as string)) {
    return Response.json({ error: 'Invalid privacy level' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  const cleanName = sanitize(name)
  if (cleanName !== null) updates.name = cleanName
  if (description !== undefined) updates.description = sanitize(description, 500)
  if (privacyLevel !== undefined) updates.privacyLevel = privacyLevel

  if (Object.keys(updates).length === 1) {
    return Response.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const [updated] = await db
    .update(organizationGroups)
    .set(updates)
    .where(and(eq(organizationGroups.id, id), eq(organizationGroups.organizationId, ctx.org.id)))
    .returning()

  if (!updated) return Response.json({ error: 'Group not found' }, { status: 404 })
  return Response.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { id } = await params
  await db
    .delete(organizationGroups)
    .where(and(eq(organizationGroups.id, id), eq(organizationGroups.organizationId, ctx.org.id)))

  return Response.json({ ok: true })
}
