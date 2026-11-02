import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, sql, desc, and, gte } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, nodes, storyReferrers, storySceneStats } from '@/lib/schema'
import { isPremiumInterval } from '@/lib/plans'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Monthly subscribers + admins only
  const isMonthly = isPremiumInterval(session.user.subscriptionInterval)
  const isAdmin = !!session.user.isAdmin
  if (!isMonthly && !isAdmin) {
    return NextResponse.json({ error: 'Analytics require a monthly subscription' }, { status: 403 })
  }

  const { id } = await params

  const [adventure] = await db
    .select({
      id: adventures.id,
      title: adventures.title,
      readCount: adventures.readCount,
      userEmail: adventures.userEmail,
    })
    .from(adventures)
    .where(eq(adventures.id, id))

  if (!adventure) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (adventure.userEmail !== session.user.email && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [byCategory, byDomain, daily, scenes] = await Promise.all([
    db
      .select({
        category: storyReferrers.referrerCategory,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(storyReferrers)
      .where(eq(storyReferrers.adventureId, id))
      .groupBy(storyReferrers.referrerCategory)
      .orderBy(desc(sql`count(*)`)),

    db
      .select({
        domain: storyReferrers.referrerDomain,
        category: storyReferrers.referrerCategory,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(storyReferrers)
      .where(eq(storyReferrers.adventureId, id))
      .groupBy(storyReferrers.referrerDomain, storyReferrers.referrerCategory)
      .orderBy(desc(sql`count(*)`))
      .limit(10),

    db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${storyReferrers.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(storyReferrers)
      .where(and(
        eq(storyReferrers.adventureId, id),
        gte(storyReferrers.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      ))
      .groupBy(sql`date_trunc('day', ${storyReferrers.createdAt})`)
      .orderBy(sql`date_trunc('day', ${storyReferrers.createdAt})`),

    db
      .select({
        title: nodes.title,
        nodeType: nodes.nodeType,
        views: storySceneStats.views,
        continues: storySceneStats.continues,
      })
      .from(storySceneStats)
      .innerJoin(nodes, eq(nodes.id, storySceneStats.nodeId))
      .where(eq(storySceneStats.adventureId, id)),
  ])

  // Reader journey: approximate, since going back or replaying counts as another view
  const endings = scenes.filter(s => s.nodeType === 'ending')
  const journey = {
    starts: Math.max(0, ...scenes.filter(s => s.nodeType === 'start').map(s => s.views)),
    completions: endings.reduce((sum, s) => sum + s.views, 0),
    endings: endings
      .map(s => ({ title: s.title, views: s.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6),
    dropOffs: scenes
      .filter(s => s.nodeType !== 'ending')
      .map(s => ({ title: s.title, exits: Math.max(0, s.views - s.continues) }))
      .filter(s => s.exits > 0)
      .sort((a, b) => b.exits - a.exits)
      .slice(0, 5),
  }

  const trackedTotal = byCategory.reduce((s, r) => s + r.count, 0)
  const socialCount = byCategory.find(r => r.category === 'social')?.count ?? 0

  return NextResponse.json({
    readCount: adventure.readCount,
    trackedTotal,
    socialCount,
    byCategory,
    byDomain,
    daily,
    journey,
  })
}
