import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import type { Adventure } from '@/lib/schema'

type OwnedResult =
  | { adventure: Adventure; email: string; error?: never }
  | { error: NextResponse; adventure?: never; email?: never }

/**
 * Verifies the request is from an authenticated user who owns the adventure.
 * Returns the adventure + email on success, or a ready-to-return NextResponse on failure.
 */
export async function requireOwner(adventureId: string): Promise<OwnedResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const [adventure] = await db.select().from(adventures).where(eq(adventures.id, adventureId))
  if (!adventure || adventure.userEmail !== session.user.email) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { adventure, email: session.user.email }
}
