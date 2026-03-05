import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nodes } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  try {
    const { nodeId } = await params
    const body = await req.json()
    const updateData: Partial<typeof nodes.$inferInsert> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.nodeType !== undefined) updateData.nodeType = body.nodeType
    if (body.positionX !== undefined) updateData.positionX = body.positionX
    if (body.positionY !== undefined) updateData.positionY = body.positionY
    if (body.status !== undefined) updateData.status = body.status
    const [updated] = await db.update(nodes).set(updateData).where(eq(nodes.id, nodeId)).returning()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  try {
    const { nodeId } = await params
    await db.delete(nodes).where(eq(nodes.id, nodeId))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 })
  }
}
