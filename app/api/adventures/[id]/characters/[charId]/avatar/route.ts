import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { worldCharacters } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { canGenerateImages } from '@/lib/subscription'
import { generateCharacterAvatar } from '@/lib/generateImage'
import { deleteBlobImage } from '@/lib/blobStorage'

export const maxDuration = 60

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; charId: string }> }) {
  try {
    const { id, charId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    if (!await canGenerateImages(owned.email)) {
      return NextResponse.json({ error: 'AI avatar generation requires a monthly subscription' }, { status: 403 })
    }

    const [char] = await db
      .select()
      .from(worldCharacters)
      .where(and(eq(worldCharacters.id, charId), eq(worldCharacters.adventureId, id)))
      .limit(1)

    if (!char) return NextResponse.json({ error: 'Character not found' }, { status: 404 })

    const avatarUrl = await generateCharacterAvatar(
      char.name,
      char.description,
      char.characterType as 'hero' | 'foe',
      owned.adventure.audience ?? 'all'
    )

    await deleteBlobImage(char.avatarUrl)

    const [updated] = await db
      .update(worldCharacters)
      .set({ avatarUrl })
      .where(and(eq(worldCharacters.id, charId), eq(worldCharacters.adventureId, id)))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    console.error('Avatar generation failed:', e)
    return NextResponse.json({ error: 'Failed to generate avatar' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; charId: string }> }) {
  try {
    const { id, charId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const [char] = await db
      .select()
      .from(worldCharacters)
      .where(and(eq(worldCharacters.id, charId), eq(worldCharacters.adventureId, id)))
      .limit(1)
    await deleteBlobImage(char?.avatarUrl)

    const [updated] = await db
      .update(worldCharacters)
      .set({ avatarUrl: null })
      .where(and(eq(worldCharacters.id, charId), eq(worldCharacters.adventureId, id)))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 })
  }
}
