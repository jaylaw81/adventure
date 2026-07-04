import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { friendInvites, users } from '@/lib/schema'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [invite] = await db
    .select({
      id: friendInvites.id,
      inviterEmail: friendInvites.inviterEmail,
      inviteeEmail: friendInvites.inviteeEmail,
      status: friendInvites.status,
    })
    .from(friendInvites)
    .where(eq(friendInvites.token, token))

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const [inviter] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.email, invite.inviterEmail))

  return NextResponse.json({
    inviterName: inviter?.displayName || invite.inviterEmail,
    inviteeEmail: invite.inviteeEmail,
    status: invite.status,
  })
}
