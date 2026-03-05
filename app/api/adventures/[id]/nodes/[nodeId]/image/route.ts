import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { nodes, adventures } from '@/lib/schema'
import { generateSceneImage } from '@/lib/generateImage'

export const maxDuration = 60

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, nodeId } = await params
    const [[node], [adventure]] = await Promise.all([
      db.select().from(nodes).where(eq(nodes.id, nodeId)),
      db.select().from(adventures).where(eq(adventures.id, id)),
    ])
    if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const imageUrl = await generateSceneImage(node.title, node.content, adventure?.audience ?? 'all')

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nodeId } = await params
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
