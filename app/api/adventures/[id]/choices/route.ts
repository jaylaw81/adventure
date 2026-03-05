import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { choices } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { eq } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const all = await db.select().from(choices).where(eq(choices.adventureId, id))
    return NextResponse.json(all)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch choices' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const { sourceNodeId, targetNodeId, label, orderIndex } = body
    if (!sourceNodeId || !targetNodeId) {
      return NextResponse.json({ error: 'sourceNodeId and targetNodeId required' }, { status: 400 })
    }
    const [choice] = await db
      .insert(choices)
      .values({
        adventureId: id,
        sourceNodeId,
        targetNodeId,
        label: label ?? 'Continue',
        orderIndex: orderIndex ?? 0,
      })
      .returning()
    return NextResponse.json(choice, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create choice' }, { status: 500 })
  }
}
