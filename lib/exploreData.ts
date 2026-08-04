import { and, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { db } from './db'
import { adventures, nodes, storyReviews, users } from './schema'

export interface ExploreStory {
  id: string
  title: string
  description: string
  audience: string
  tags: string
  storyType: string | null
  shareToken: string | null
  storySlug: string | null
  readCount: number
  createdAt: Date
  updatedAt: Date
  avgRating: number | null
  reviewCount: number
  coverImageUrl: string | null
  authorUsername: string | null
  authorDisplayName: string | null
  authorProfileVisible: boolean | null
}

export async function getExploreStories(): Promise<ExploreStory[]> {
  const [stories, ratingRows] = await Promise.all([
    db
      .select({
        id: adventures.id,
        title: adventures.title,
        description: adventures.description,
        audience: adventures.audience,
        tags: adventures.tags,
        storyType: adventures.storyType,
        shareToken: adventures.shareToken,
        storySlug: adventures.storySlug,
        readCount: adventures.readCount,
        createdAt: adventures.createdAt,
        updatedAt: adventures.updatedAt,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorProfileVisible: users.profileVisible,
      })
      .from(adventures)
      .leftJoin(users, eq(users.email, adventures.userEmail))
      .where(and(eq(adventures.isPublic, true), eq(adventures.status, 'active')))
      .orderBy(desc(adventures.updatedAt)),
    db
      .select({
        adventureId: storyReviews.adventureId,
        avgRating: sql<number>`round(avg(${storyReviews.rating})::numeric, 1)::float`,
        reviewCount: sql<number>`count(${storyReviews.id})::int`,
      })
      .from(storyReviews)
      .where(eq(storyReviews.hidden, false))
      .groupBy(storyReviews.adventureId),
  ])

  const adventureIds = stories.map(s => s.id)
  const coverImages = adventureIds.length > 0
    ? await db
        .select({ adventureId: nodes.adventureId, imageUrl: nodes.imageUrl })
        .from(nodes)
        .where(and(
          inArray(nodes.adventureId, adventureIds),
          eq(nodes.nodeType, 'start'),
          isNotNull(nodes.imageUrl),
        ))
    : []

  const coverMap = new Map<string, string>()
  for (const row of coverImages) {
    if (!coverMap.has(row.adventureId) && row.imageUrl) {
      coverMap.set(row.adventureId, row.imageUrl)
    }
  }

  const ratingMap = new Map(ratingRows.map(r => [r.adventureId, r]))

  return stories.map(s => ({
    ...s,
    avgRating: ratingMap.get(s.id)?.avgRating ?? null,
    reviewCount: ratingMap.get(s.id)?.reviewCount ?? 0,
    coverImageUrl: coverMap.get(s.id) ?? null,
  }))
}
