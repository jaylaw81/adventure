import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { getAdventureWithData } from '@/lib/queries'
import { requireOwner } from '@/lib/requireOwner'
import { eq } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const adventure = await getAdventureWithData(id)
    if (!adventure) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(adventure)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch adventure' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const { title, description, audience, tags } = body
    const updateData: Partial<typeof adventures.$inferInsert> = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (audience !== undefined) updateData.audience = audience
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    const [updated] = await db
      .update(adventures)
      .set(updateData)
      .where(eq(adventures.id, id))
      .returning()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update adventure' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    await db.delete(adventures).where(eq(adventures.id, id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete adventure' }, { status: 500 })
  }
}
