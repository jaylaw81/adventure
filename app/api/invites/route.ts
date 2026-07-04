import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, count } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, friendInvites } from '@/lib/schema'
import { sendFriendInviteEmail } from '@/lib/email'
import crypto from 'crypto'

const MAX_INVITES = 5

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email
  const invites = await db
    .select()
    .from(friendInvites)
    .where(eq(friendInvites.inviterEmail, email))
    .orderBy(friendInvites.createdAt)

  return NextResponse.json({
    invites,
    remaining: Math.max(0, MAX_INVITES - invites.length),
    max: MAX_INVITES,
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email

  try {
    const { inviteeEmail } = await req.json()
    if (!inviteeEmail || typeof inviteeEmail !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedInvitee = inviteeEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedInvitee)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (normalizedInvitee === email) {
      return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 })
    }

    // Check if invitee is already a user
    const [existingUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, normalizedInvitee))

    if (existingUser) {
      return NextResponse.json({ error: 'That person already has a StoryQuestor account' }, { status: 400 })
    }

    // Check invite limit
    const [{ total }] = await db
      .select({ total: count() })
      .from(friendInvites)
      .where(eq(friendInvites.inviterEmail, email))

    if (total >= MAX_INVITES) {
      return NextResponse.json({ error: `You have used all ${MAX_INVITES} invites` }, { status: 400 })
    }

    // Check for duplicate invite to same email (from anyone)
    const [dupCheck] = await db
      .select({ id: friendInvites.id })
      .from(friendInvites)
      .where(eq(friendInvites.inviteeEmail, normalizedInvitee))

    if (dupCheck) {
      return NextResponse.json({ error: 'An invite has already been sent to that email' }, { status: 400 })
    }

    // Get inviter display name
    const [inviter] = await db
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.email, email))

    const inviterName = inviter?.displayName || email

    const token = crypto.randomBytes(24).toString('hex')
    const [invite] = await db.insert(friendInvites).values({
      inviterEmail: email,
      inviteeEmail: normalizedInvitee,
      token,
    }).returning()

    sendFriendInviteEmail({
      to: normalizedInvitee,
      inviterName,
      token,
    }).catch(console.error)

    return NextResponse.json({ ok: true, invite })
  } catch {
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
