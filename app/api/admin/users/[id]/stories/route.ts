import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, eq, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, nodes, users } from '@/lib/schema'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, id))
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [userStories, nodeCounts] = await Promise.all([
    db
      .select({
        id: adventures.id,
        title: adventures.title,
        description: adventures.description,
        audience: adventures.audience,
        isPublic: adventures.isPublic,
        status: adventures.status,
        tags: adventures.tags,
        createdAt: adventures.createdAt,
        updatedAt: adventures.updatedAt,
      })
      .from(adventures)
      .where(eq(adventures.userEmail, user.email))
      .orderBy(desc(adventures.createdAt)),
    db
      .select({ adventureId: nodes.adventureId, count: sql<number>`count(*)::int` })
      .from(nodes)
      .groupBy(nodes.adventureId),
  ])

  const nodeMap = new Map(nodeCounts.map(r => [r.adventureId, r.count]))

  return NextResponse.json(
    userStories.map(s => ({ ...s, sceneCount: nodeMap.get(s.id) ?? 0 }))
  )
}
