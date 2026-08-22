import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { nodes } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { generateSceneImage, generateStorybookPageImage } from '@/lib/generateImage'
import { canGenerateImages } from '@/lib/subscription'
import { validateImageDataUrl } from '@/lib/imageValidation'

export const maxDuration = 60

export async function POST(req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  try {
    const { id, nodeId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error
    if (!await canGenerateImages(owned.email)) {
      return NextResponse.json({ error: 'Scene images require a monthly subscription' }, { status: 403 })
    }

    const [node] = await db.select().from(nodes).where(and(eq(nodes.id, nodeId), eq(nodes.adventureId, id)))
    if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Storybook pages support upload/hand-drawn sources in addition to AI generation.
    const body = await req.json().catch(() => ({})) as { source?: 'upload' | 'draw'; dataUrl?: string }

    let imageUrl: string
    if (body.source === 'upload' || body.source === 'draw') {
      const validated = validateImageDataUrl(body.dataUrl)
      if (!validated) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      imageUrl = validated
    } else if (owned.adventure.storyType === 'storybook') {
      imageUrl = await generateStorybookPageImage(node.title, node.content, owned.adventure.audience ?? 'all')
    } else {
      imageUrl = await generateSceneImage(node.title, node.content, owned.adventure.audience ?? 'all')
    }

    const [updated] = await db
      .update(nodes)
      .set({ imageUrl })
      .where(and(eq(nodes.id, nodeId), eq(nodes.adventureId, id)))
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
      .where(and(eq(nodes.id, nodeId), eq(nodes.adventureId, id)))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}
