import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { getPublicAdventures } from '@/lib/queries'
import { db } from '@/lib/db'
import { storyReviews } from '@/lib/schema'

export const revalidate = 60

export async function GET() {
  try {
    const [stories, ratingRows] = await Promise.all([
      getPublicAdventures(),
      db
        .select({
          adventureId: storyReviews.adventureId,
          avgRating: sql<number>`round(avg(${storyReviews.rating})::numeric, 1)::float`,
          reviewCount: sql<number>`count(*)::int`,
        })
        .from(storyReviews)
        .where(eq(storyReviews.hidden, false))
        .groupBy(storyReviews.adventureId),
    ])

    const ratingMap = new Map(ratingRows.map(r => [r.adventureId, r]))
    const result = stories.map(s => ({
      ...s,
      avgRating: ratingMap.get(s.id)?.avgRating ?? null,
      reviewCount: ratingMap.get(s.id)?.reviewCount ?? 0,
    }))

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
