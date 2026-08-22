import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { generateUniqueSlug } from '@/lib/ensureStorySlug'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  const slug = await generateUniqueSlug(owned.adventure.title, id)

  await db.update(adventures).set({ storySlug: slug, updatedAt: new Date() }).where(eq(adventures.id, id))
  return NextResponse.json({ slug })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  await db.update(adventures).set({ storySlug: null, updatedAt: new Date() }).where(eq(adventures.id, id))
  return NextResponse.json({ success: true })
}
