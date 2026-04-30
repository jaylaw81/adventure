import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationInvites } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function DELETE(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const { token } = await params

  await db
    .update(organizationInvites)
    .set({ status: 'expired' })
    .where(and(
      eq(organizationInvites.organizationId, ctx.org.id),
      eq(organizationInvites.token, token),
    ))

  return Response.json({ ok: true })
}
