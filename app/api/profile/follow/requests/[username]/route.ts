import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and, inArray } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, follows } from '@/lib/schema'

// Removes a pending or denied follow request outright — clears it from the Denied list entirely.
export async function DELETE(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const normalized = username.trim().toLowerCase()

  const [follower] = await db.select({ email: users.email }).from(users).where(eq(users.username, normalized))
  if (follower) {
    await db
      .delete(follows)
      .where(and(
        eq(follows.followerEmail, follower.email),
        eq(follows.followingEmail, session.user.email),
        inArray(follows.status, ['pending', 'denied']),
      ))
  }

  return NextResponse.json({ success: true })
}
