import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { worldCharacters } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { and, eq } from 'drizzle-orm'
import type { CharacterAttribute } from '@/lib/worldBuilder'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; charId: string }> }) {
  try {
    const { id, charId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const updateData: Partial<typeof worldCharacters.$inferInsert> = {}
    if (body.name !== undefined) updateData.name = String(body.name).trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() ?? null
    if (body.attributes !== undefined) updateData.attributes = body.attributes as CharacterAttribute[]
    if (body.inventoryCapacity !== undefined) updateData.inventoryCapacity = body.inventoryCapacity === null ? null : Number(body.inventoryCapacity)
    if (body.orderIndex !== undefined) updateData.orderIndex = Number(body.orderIndex)
    if (body.characterType !== undefined) updateData.characterType = body.characterType
    if (body.foeHp !== undefined) updateData.foeHp = body.foeHp === null ? null : Number(body.foeHp)
    if (body.foeDamage !== undefined) updateData.foeDamage = body.foeDamage === null ? null : Number(body.foeDamage)
    if (body.foeDefeatText !== undefined) updateData.foeDefeatText = body.foeDefeatText?.trim() ?? null
    if (body.emoji !== undefined) updateData.emoji = body.emoji?.trim() || null
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl || null
    if (body.healthAttributeId !== undefined) updateData.healthAttributeId = body.healthAttributeId || null
    if (body.armorAttributeId !== undefined) updateData.armorAttributeId = body.armorAttributeId || null

    const [updated] = await db
      .update(worldCharacters)
      .set(updateData)
      .where(and(eq(worldCharacters.id, charId), eq(worldCharacters.adventureId, id)))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; charId: string }> }) {
  try {
    const { id, charId } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    await db.delete(worldCharacters).where(and(eq(worldCharacters.id, charId), eq(worldCharacters.adventureId, id)))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 })
  }
}
