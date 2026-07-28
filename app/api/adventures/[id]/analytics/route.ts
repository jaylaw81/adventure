import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, sql, desc, and, gte } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, storyReferrers } from '@/lib/schema'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Monthly subscribers + admins only
  const isMonthly = session.user.subscriptionInterval === 'month'
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

  const [byCategory, byDomain, daily] = await Promise.all([
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
  ])

  const trackedTotal = byCategory.reduce((s, r) => s + r.count, 0)
  const socialCount = byCategory.find(r => r.category === 'social')?.count ?? 0

  return NextResponse.json({
    readCount: adventure.readCount,
    trackedTotal,
    socialCount,
    byCategory,
    byDomain,
    daily,
  })
}
