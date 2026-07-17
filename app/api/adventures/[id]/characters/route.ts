import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { worldCharacters } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { eq, sql } from 'drizzle-orm'
import type { CharacterAttribute } from '@/lib/worldBuilder'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error
    const chars = await db.select().from(worldCharacters).where(eq(worldCharacters.adventureId, id)).orderBy(worldCharacters.orderIndex)
    return NextResponse.json(chars)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const { name, description, attributes = [], inventoryCapacity, characterType, foeHp, foeDamage, foeDefeatText, emoji, healthAttributeId, armorAttributeId } = body as {
      name: string
      description?: string
      attributes?: CharacterAttribute[]
      inventoryCapacity?: number | null
      characterType?: string
      foeHp?: number | null
      foeDamage?: number | null
      foeDefeatText?: string | null
      emoji?: string | null
      healthAttributeId?: string | null
      armorAttributeId?: string | null
    }
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    // Get max orderIndex for this adventure
    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${worldCharacters.orderIndex}), -1)` })
      .from(worldCharacters)
      .where(eq(worldCharacters.adventureId, id))

    const [char] = await db.insert(worldCharacters).values({
      adventureId: id,
      name: name.trim(),
      description: description?.trim() ?? null,
      attributes,
      inventoryCapacity: inventoryCapacity ?? null,
      characterType: characterType ?? 'hero',
      foeHp: foeHp ?? null,
      foeDamage: foeDamage ?? null,
      foeDefeatText: foeDefeatText?.trim() ?? null,
      emoji: emoji?.trim() || null,
      healthAttributeId: healthAttributeId ?? null,
      armorAttributeId: armorAttributeId ?? null,
      orderIndex: (maxOrder ?? -1) + 1,
    }).returning()

    return NextResponse.json(char, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 })
  }
}
