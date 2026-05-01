import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { adventures, organizationMembers } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

async function resolveAdminAndStory(email: string, storyId: string) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return null

  const [member] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, ctx.org.id),
      eq(organizationMembers.userEmail, email),
    ))
    .limit(1)
  if (!member) return null

  const [story] = await db
    .select()
    .from(adventures)
    .where(and(eq(adventures.id, storyId), eq(adventures.userEmail, email)))
    .limit(1)
  if (!story) return null

  return { ctx, story }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ email: string; storyId: string }> }) {
  const { email, storyId } = await params
  const targetEmail = decodeURIComponent(email)

  const result = await resolveAdminAndStory(targetEmail, storyId)
  if (!result) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { status, isPublic, title, description } = body as Record<string, unknown>
  const patch: Partial<typeof adventures.$inferInsert> = { updatedAt: new Date() }

  if (status === 'active' || status === 'suspended') patch.status = status
  if (typeof isPublic === 'boolean') patch.isPublic = isPublic
  if (typeof title === 'string' && title.trim()) patch.title = title.trim()
  if (typeof description === 'string') patch.description = description.trim()

  const [updated] = await db.update(adventures).set(patch).where(eq(adventures.id, storyId)).returning()
  return Response.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ email: string; storyId: string }> }) {
  const { email, storyId } = await params
  const targetEmail = decodeURIComponent(email)

  const result = await resolveAdminAndStory(targetEmail, storyId)
  if (!result) return unauthorized()

  await db.delete(adventures).where(eq(adventures.id, storyId))
  return Response.json({ ok: true })
}
