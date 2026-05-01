import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { adventures, organizationMembers } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ email: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { email } = await params
  const targetEmail = decodeURIComponent(email)

  const [member] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, ctx.org.id),
      eq(organizationMembers.userEmail, targetEmail),
    ))
    .limit(1)

  if (!member) return Response.json({ error: 'Member not found' }, { status: 404 })

  const stories = await db
    .select()
    .from(adventures)
    .where(eq(adventures.userEmail, targetEmail))
    .orderBy(desc(adventures.updatedAt))

  return Response.json(stories)
}
