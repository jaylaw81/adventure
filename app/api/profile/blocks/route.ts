import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and, or } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, userBlocks, follows } from '@/lib/schema'
import { getBlockedUsers } from '@/lib/queries'

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await getBlockedUsers(session.user.email!)
  return NextResponse.json(blocked)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 })
  }

  const [target] = await db.select({ email: users.email, username: users.username }).from(users).where(eq(users.username, username))
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (target.email === session.user.email) {
    return NextResponse.json({ error: "You can't block yourself" }, { status: 400 })
  }

  await db
    .insert(userBlocks)
    .values({ blockerEmail: session.user.email!, blockedEmail: target.email })
    .onConflictDoNothing()

  // Blocking severs any existing follow relationship in either direction
  await db
    .delete(follows)
    .where(or(
      and(eq(follows.followerEmail, session.user.email!), eq(follows.followingEmail, target.email)),
      and(eq(follows.followerEmail, target.email), eq(follows.followingEmail, session.user.email!)),
    ))

  return NextResponse.json({ username: target.username })
}
