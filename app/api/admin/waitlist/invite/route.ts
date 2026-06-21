import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationWaitlist } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sendWaitlistAccepted } from '@/lib/email'

const INVITE_TTL_DAYS = 30

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, name } = await req.json()
  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Check for existing entry with this email
  const [existing] = await db
    .select({ id: organizationWaitlist.id, status: organizationWaitlist.status })
    .from(organizationWaitlist)
    .where(eq(organizationWaitlist.email, normalizedEmail))
    .limit(1)

  if (existing?.status === 'accepted') {
    return Response.json({ error: 'This email has already been invited' }, { status: 409 })
  }

  const inviteToken = crypto.randomUUID()
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
  const inviteSentAt = new Date()
  const trimmedName = name?.trim() || null

  let entryId: string

  if (existing) {
    // Waitlist entry exists (pending/denied) — update it to accepted
    await db
      .update(organizationWaitlist)
      .set({ status: 'accepted', inviteToken, inviteExpiresAt, inviteSentAt, ...(trimmedName ? { name: trimmedName } : {}) })
      .where(eq(organizationWaitlist.id, existing.id))
    entryId = existing.id
  } else {
    // New direct invite — create a waitlist entry already in accepted state
    const [newEntry] = await db
      .insert(organizationWaitlist)
      .values({
        email: normalizedEmail,
        name: trimmedName,
        status: 'accepted',
        inviteToken,
        inviteExpiresAt,
        inviteSentAt,
      })
      .returning({ id: organizationWaitlist.id })
    entryId = newEntry.id
  }

  await sendWaitlistAccepted({
    to: normalizedEmail,
    name: trimmedName,
    inviteToken,
    expiresAt: inviteExpiresAt,
  })

  return Response.json({
    ok: true,
    entry: {
      id: entryId,
      email: normalizedEmail,
      name: trimmedName,
      school: null,
      role: null,
      status: 'accepted',
      inviteSentAt: inviteSentAt.toISOString(),
      createdAt: new Date().toISOString(),
    },
  })
}
