import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { choices } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { eq } from 'drizzle-orm'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; choiceId: string }> }) {
  try {
    const { id, choiceId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const updateData: Partial<typeof choices.$inferInsert> = {}
    if (body.label !== undefined) updateData.label = body.label
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex
    if (body.sourceNodeId !== undefined) updateData.sourceNodeId = body.sourceNodeId
    if (body.targetNodeId !== undefined) updateData.targetNodeId = body.targetNodeId
    const [updated] = await db.update(choices).set(updateData).where(eq(choices.id, choiceId)).returning()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update choice' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; choiceId: string }> }) {
  try {
    const { id, choiceId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    await db.delete(choices).where(eq(choices.id, choiceId))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete choice' }, { status: 500 })
  }
}
