import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationMembers, adventures } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'

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

  const [updated] = await db
    .update(adventures)
    .set({ isPublic, updatedAt: new Date() })
    .where(and(eq(adventures.id, id), inArray(adventures.userEmail, memberEmails)))
    .returning()

  if (!updated) return Response.json({ error: 'Story not found or not in your organization' }, { status: 404 })

  return Response.json({ ok: true, isPublic: updated.isPublic })
}
