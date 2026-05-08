import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationWaitlist } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sendWaitlistDenied } from '@/lib/email'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const [entry] = await db
    .select()
    .from(organizationWaitlist)
    .where(eq(organizationWaitlist.id, id))
    .limit(1)

  if (!entry) {
    return Response.json({ error: 'Waitlist entry not found' }, { status: 404 })
  }

  if (entry.status === 'denied') {
    return Response.json({ error: 'Already denied' }, { status: 409 })
  }

  await db
    .update(organizationWaitlist)
    .set({ status: 'denied', inviteToken: null, inviteExpiresAt: null })
    .where(eq(organizationWaitlist.id, id))

  await sendWaitlistDenied({ to: entry.email, name: entry.name })

  return Response.json({ ok: true })
}
