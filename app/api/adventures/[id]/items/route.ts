import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { worldItems } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { eq, sql } from 'drizzle-orm'
import type { CharacterEffect } from '@/lib/worldBuilder'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error
    const items = await db.select().from(worldItems).where(eq(worldItems.adventureId, id)).orderBy(worldItems.orderIndex)
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    const body = await req.json()
    const { name, description, itemType = 'item', effects = [], emoji } = body as {
      name: string
      description?: string
      itemType?: string
      effects?: CharacterEffect[]
      emoji?: string
    }
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${worldItems.orderIndex}), -1)` })
      .from(worldItems)
      .where(eq(worldItems.adventureId, id))

    const { damage, durabilityMax, durabilityLoss, reviveAmount } = body as { damage?: number | null; durabilityMax?: number | null; durabilityLoss?: number | null; reviveAmount?: number | null }

    const [item] = await db.insert(worldItems).values({
      adventureId: id,
      name: name.trim(),
      description: description?.trim() ?? null,
      itemType,
      effects,
      emoji: emoji?.trim() || null,
      damage: damage ?? null,
      durabilityMax: durabilityMax ?? null,
      durabilityLoss: durabilityLoss ?? null,
      reviveAmount: reviveAmount ?? null,
      orderIndex: (maxOrder ?? -1) + 1,
    }).returning()

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
