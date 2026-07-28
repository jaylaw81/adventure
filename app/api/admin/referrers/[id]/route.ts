import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, sql, desc, and, gte } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { storyReferrers, adventures } from '@/lib/schema'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.isAdmin ? session : null
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [adventure] = await db
    .select({ id: adventures.id, title: adventures.title, readCount: adventures.readCount })
    .from(adventures)
    .where(eq(adventures.id, id))

  if (!adventure) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Category breakdown — all time
  const byCategory = await db
    .select({
      category: storyReferrers.referrerCategory,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(storyReferrers)
    .where(eq(storyReferrers.adventureId, id))
    .groupBy(storyReferrers.referrerCategory)
    .orderBy(desc(sql`count(*)`))

  // Top domains — all time, capped at 25
  const byDomain = await db
    .select({
      domain: storyReferrers.referrerDomain,
      category: storyReferrers.referrerCategory,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(storyReferrers)
    .where(eq(storyReferrers.adventureId, id))
    .groupBy(storyReferrers.referrerDomain, storyReferrers.referrerCategory)
    .orderBy(desc(sql`count(*)`))
    .limit(25)

  // Daily reads — last 60 days
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const daily = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${storyReferrers.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(storyReferrers)
    .where(and(
      eq(storyReferrers.adventureId, id),
      gte(storyReferrers.createdAt, sixtyDaysAgo),
    ))
    .groupBy(sql`date_trunc('day', ${storyReferrers.createdAt})`)
    .orderBy(sql`date_trunc('day', ${storyReferrers.createdAt})`)

  const trackedTotal = byCategory.reduce((s, r) => s + r.count, 0)

  return NextResponse.json({ adventure, byCategory, byDomain, daily, trackedTotal })
}
