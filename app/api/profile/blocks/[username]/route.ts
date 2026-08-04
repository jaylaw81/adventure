import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, userBlocks } from '@/lib/schema'

export async function DELETE(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const normalized = username.trim().toLowerCase()

  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.username, normalized))
  if (target) {
    await db
      .delete(userBlocks)
      .where(and(eq(userBlocks.blockerEmail, session.user.email), eq(userBlocks.blockedEmail, target.email)))
  }

  return NextResponse.json({ success: true })
}
