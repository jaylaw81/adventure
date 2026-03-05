import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    // Verify ownership
    const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
    if (!adventure || adventure.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Generate a token if one doesn't already exist, then make public
    const token = adventure.shareToken ?? crypto.randomUUID().replace(/-/g, '')
    const [updated] = await db
      .update(adventures)
      .set({ isPublic: true, shareToken: token })
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to enable sharing' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
    if (!adventure || adventure.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const [updated] = await db
      .update(adventures)
      .set({ isPublic: false })
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to disable sharing' }, { status: 500 })
  }
}
