import { NextResponse } from 'next/server'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chapters, nodes } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await db
    .select()
    .from(chapters)
    .where(eq(chapters.adventureId, id))
    .orderBy(asc(chapters.orderIndex))
  return NextResponse.json(all)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  const body = await req.json()
  const title: string = body.title?.trim() || 'New Chapter'

  // Determine next orderIndex
  const existing = await db
    .select({ orderIndex: chapters.orderIndex })
    .from(chapters)
    .where(eq(chapters.adventureId, id))
    .orderBy(asc(chapters.orderIndex))

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].orderIndex + 1 : 0

  const [chapter] = await db
    .insert(chapters)
    .values({ adventureId: id, title, orderIndex: nextOrder })
    .returning()

  // Auto-create a start node for the new chapter
  const [startNode] = await db
    .insert(nodes)
    .values({
      adventureId: id,
      chapterId: chapter.id,
      title: 'Chapter Start',
      content: '',
      nodeType: 'start',
      positionX: 100,
      positionY: 100,
    })
    .returning()

  return NextResponse.json({ chapter, startNode }, { status: 201 })
}
