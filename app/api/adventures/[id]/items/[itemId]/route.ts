import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { worldItems } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { and, eq } from 'drizzle-orm'
import type { CharacterEffect } from '@/lib/worldBuilder'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { id, itemId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json() as {
      name?: string
      description?: string
      itemType?: string
      effects?: CharacterEffect[]
      emoji?: string
      damage?: number | null
      durabilityMax?: number | null
      durabilityLoss?: number | null
      reviveAmount?: number | null
    }

    const updateData: Partial<typeof worldItems.$inferInsert> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.itemType !== undefined) updateData.itemType = body.itemType
    if (body.effects !== undefined) updateData.effects = body.effects
    if (body.emoji !== undefined) updateData.emoji = body.emoji?.trim() || null
    if (body.damage !== undefined) updateData.damage = body.damage === null ? null : Number(body.damage)
    if (body.durabilityMax !== undefined) updateData.durabilityMax = body.durabilityMax === null ? null : Number(body.durabilityMax)
    if (body.durabilityLoss !== undefined) updateData.durabilityLoss = body.durabilityLoss === null ? null : Number(body.durabilityLoss)
    if (body.reviveAmount !== undefined) updateData.reviveAmount = body.reviveAmount === null ? null : Number(body.reviveAmount)

    const [updated] = await db
      .update(worldItems)
      .set(updateData)
      .where(and(eq(worldItems.id, itemId), eq(worldItems.adventureId, id)))
      .returning()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { id, itemId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error
    await db.delete(worldItems).where(and(eq(worldItems.id, itemId), eq(worldItems.adventureId, id)))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
