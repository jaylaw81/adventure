import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nodes } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { eq } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const all = await db.select().from(nodes).where(eq(nodes.adventureId, id))
    return NextResponse.json(all)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const [node] = await db
      .insert(nodes)
      .values({
        adventureId: id,
        title: body.title ?? 'New Scene',
        content: body.content ?? '',
        nodeType: body.nodeType ?? 'scene',
        positionX: body.positionX ?? 100,
        positionY: body.positionY ?? 100,
      })
      .returning()
    return NextResponse.json(node, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 })
  }
}
