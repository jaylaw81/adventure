import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { generateStorybookCoverImage } from '@/lib/generateImage'
import { canGenerateImages } from '@/lib/subscription'
import { validateImageDataUrl } from '@/lib/imageValidation'

export const maxDuration = 60

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error
    if (!await canGenerateImages(owned.email)) {
      return NextResponse.json({ error: 'Cover art requires a monthly subscription' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({})) as { source?: 'upload' | 'draw'; dataUrl?: string }

    let coverImageUrl: string
    if (body.source === 'upload' || body.source === 'draw') {
      const validated = validateImageDataUrl(body.dataUrl)
      if (!validated) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      coverImageUrl = validated
    } else {
      coverImageUrl = await generateStorybookCoverImage(
        owned.adventure.title,
        owned.adventure.description ?? '',
        owned.adventure.audience ?? 'all'
      )
    }

    const [updated] = await db
      .update(adventures)
      .set({ coverImageUrl })
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    console.error('Cover generation failed:', e)
    return NextResponse.json({ error: 'Failed to generate cover' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const [updated] = await db
      .update(adventures)
      .set({ coverImageUrl: null })
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to remove cover' }, { status: 500 })
  }
}
