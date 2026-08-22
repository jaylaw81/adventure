import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationMembers, adventures } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { generateUniqueSlug } from '@/lib/ensureStorySlug'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { isPublic } = body as Record<string, unknown>
  if (typeof isPublic !== 'boolean') {
    return Response.json({ error: 'isPublic must be a boolean' }, { status: 400 })
  }

  // Verify the story belongs to an org member
  const members = await db
    .select({ userEmail: organizationMembers.userEmail })
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, ctx.org.id))

  const memberEmails = members.map(m => m.userEmail)
  if (memberEmails.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  const patch: Partial<typeof adventures.$inferInsert> = { isPublic, updatedAt: new Date() }
  if (isPublic) {
    const [story] = await db
      .select({ title: adventures.title, storySlug: adventures.storySlug })
      .from(adventures)
      .where(and(eq(adventures.id, id), inArray(adventures.userEmail, memberEmails)))
      .limit(1)
    if (!story) return Response.json({ error: 'Story not found or not in your organization' }, { status: 404 })
    if (!story.storySlug) patch.storySlug = await generateUniqueSlug(story.title, id)
  }

  const [updated] = await db
    .update(adventures)
    .set(patch)
    .where(and(eq(adventures.id, id), inArray(adventures.userEmail, memberEmails)))
    .returning()

  if (!updated) return Response.json({ error: 'Story not found or not in your organization' }, { status: 404 })

  return Response.json({ ok: true, isPublic: updated.isPublic })
}
