import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, follows } from '@/lib/schema'

export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const normalized = username.trim().toLowerCase()

  const [follower] = await db.select({ email: users.email }).from(users).where(eq(users.username, normalized))
  if (!follower) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const [updated] = await db
    .update(follows)
    .set({ status: 'accepted', respondedAt: new Date() })
    .where(and(
      eq(follows.followerEmail, follower.email),
      eq(follows.followingEmail, session.user.email),
      eq(follows.status, 'pending'),
    ))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
