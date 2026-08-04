import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, follows } from '@/lib/schema'
import { getFollowStatus, isBlocked } from '@/lib/queries'
import { sendFollowRequestEmail } from '@/lib/email'

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session
}

async function resolveTarget(username: string) {
  const normalized = username.trim().toLowerCase()
  const [target] = await db
    .select({ email: users.email, username: users.username, displayName: users.displayName, profileVisible: users.profileVisible })
    .from(users)
    .where(eq(users.username, normalized))
  return target ?? null
}

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const target = await resolveTarget(username)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const status = await getFollowStatus(session.user.email!, target.email)
  return NextResponse.json({ status })
}

export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const target = await resolveTarget(username)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.email === session.user.email) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 })
  }

  const [blockedByTarget, blockedByMe] = await Promise.all([
    isBlocked(target.email, session.user.email!),
    isBlocked(session.user.email!, target.email),
  ])
  if (blockedByTarget || blockedByMe) {
    return NextResponse.json({ error: 'Unable to follow this user' }, { status: 400 })
  }

  const status: 'pending' | 'accepted' = target.profileVisible ? 'accepted' : 'pending'

  await db
    .insert(follows)
    .values({
      followerEmail: session.user.email!,
      followingEmail: target.email,
      status,
      respondedAt: status === 'accepted' ? new Date() : null,
    })
    .onConflictDoNothing()

  if (status === 'pending') {
    sendFollowRequestEmail({
      to: target.email,
      followerName: session.user.name ?? session.user.email!,
      followerUsername: session.user.username ?? '',
    }).catch(() => {})
  }

  const finalStatus = await getFollowStatus(session.user.email!, target.email)
  return NextResponse.json({ status: finalStatus })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const target = await resolveTarget(username)
  if (target) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerEmail, session.user.email!), eq(follows.followingEmail, target.email)))
  }

  return NextResponse.json({ status: 'none' })
}
