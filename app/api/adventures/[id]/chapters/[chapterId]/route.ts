import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chapters, nodes } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const { id, chapterId } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  const body = await req.json()
  const updateData: Partial<typeof chapters.$inferInsert> = {}
  if (body.title !== undefined) updateData.title = body.title.trim() || 'New Chapter'
  if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex

  const [updated] = await db
    .update(chapters)
    .set(updateData)
    .where(and(eq(chapters.id, chapterId), eq(chapters.adventureId, id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const { id, chapterId } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  // Nodes cascade-set chapterId to null via FK onDelete: 'set null' —
  // but we also clear nextChapterId references pointing to this chapter
  await db
    .update(nodes)
    .set({ nextChapterId: null })
    .where(eq(nodes.nextChapterId, chapterId))

  await db.delete(chapters).where(and(eq(chapters.id, chapterId), eq(chapters.adventureId, id)))
  return NextResponse.json({ ok: true })
}
