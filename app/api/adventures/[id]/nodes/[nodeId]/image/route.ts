import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { nodes } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { generateSceneImage } from '@/lib/generateImage'

export const maxDuration = 60

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  try {
    const { id, nodeId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const [node] = await db.select().from(nodes).where(eq(nodes.id, nodeId))
    if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const imageUrl = await generateSceneImage(node.title, node.content, owned.adventure.audience ?? 'all')

    const [updated] = await db
      .update(nodes)
      .set({ imageUrl })
      .where(eq(nodes.id, nodeId))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    console.error('Image generation failed:', e)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  try {
    const { id, nodeId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error
    const [updated] = await db
      .update(nodes)
      .set({ imageUrl: null })
      .where(eq(nodes.id, nodeId))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}
