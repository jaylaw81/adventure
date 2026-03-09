import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, nodes } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [allAdventures, nodeCounts] = await Promise.all([
    db
      .select({
        id: adventures.id,
        title: adventures.title,
        description: adventures.description,
        userEmail: adventures.userEmail,
        audience: adventures.audience,
        isPublic: adventures.isPublic,
        tags: adventures.tags,
        createdAt: adventures.createdAt,
        updatedAt: adventures.updatedAt,
      })
      .from(adventures)
      .orderBy(desc(adventures.createdAt)),
    db
      .select({
        adventureId: nodes.adventureId,
        count: sql<number>`count(*)::int`,
      })
      .from(nodes)
      .groupBy(nodes.adventureId),
  ])

  const countMap = new Map(nodeCounts.map(r => [r.adventureId, r.count]))
  const stories = allAdventures.map(a => ({ ...a, sceneCount: countMap.get(a.id) ?? 0 }))

  return NextResponse.json(stories)
}
