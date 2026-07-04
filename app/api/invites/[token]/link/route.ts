import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { friendInvites, users } from '@/lib/schema'

// Called after a user authenticates via Google on the invite page
// to link the invite token to their account.
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params
  const email = session.user.email

  const [invite] = await db
    .select()
    .from(friendInvites)
    .where(and(eq(friendInvites.token, token)))

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  if (invite.inviterEmail === email) {
    return NextResponse.json({ error: 'Cannot use your own invite' }, { status: 400 })
  }

  // Only link if user doesn't already have an invite association and invite is still open
  const [user] = await db
    .select({ invitedByToken: users.invitedByToken })
    .from(users)
    .where(eq(users.email, email))

  if (!user?.invitedByToken && invite.status === 'pending') {
    await Promise.all([
      db.update(users)
        .set({ invitedByToken: token })
        .where(eq(users.email, email)),
      db.update(friendInvites)
        .set({ status: 'signed_up', signedUpAt: new Date() })
        .where(eq(friendInvites.token, token)),
    ])
  }

  return NextResponse.json({ ok: true })
}
