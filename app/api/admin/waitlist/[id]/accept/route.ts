import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationWaitlist } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sendWaitlistAccepted } from '@/lib/email'

const INVITE_TTL_DAYS = 30

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

  if (entry.status === 'accepted') {
    return Response.json({ error: 'Already accepted' }, { status: 409 })
  }

  const inviteToken = crypto.randomUUID()
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)

  await db
    .update(organizationWaitlist)
    .set({ status: 'accepted', inviteToken, inviteExpiresAt, inviteSentAt: new Date() })
    .where(eq(organizationWaitlist.id, id))

  await sendWaitlistAccepted({
    to: entry.email,
    name: entry.name,
    inviteToken,
    expiresAt: inviteExpiresAt,
  })

  return Response.json({ ok: true })
}
