import { NextResponse } from 'next/server'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { storyReviews, users, adventures } from '@/lib/schema'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const visible = and(eq(storyReviews.adventureId, id), eq(storyReviews.hidden, false))

  const [reviews, [aggregate]] = await Promise.all([
    db
      .select({
        id: storyReviews.id,
        rating: storyReviews.rating,
        reviewText: storyReviews.reviewText,
        reviewerEmail: storyReviews.reviewerEmail,
        reviewerName: users.displayName,
        createdAt: storyReviews.createdAt,
      })
      .from(storyReviews)
      .leftJoin(users, eq(storyReviews.reviewerEmail, users.email))
      .where(visible)
      .orderBy(desc(storyReviews.createdAt)),
    db
      .select({
        avgRating: sql<number>`round(avg(${storyReviews.rating})::numeric, 1)::float`,
        totalCount: sql<number>`count(*)::int`,
      })
      .from(storyReviews)
      .where(visible),
  ])

  // Include the current user's own review even if hidden (so they can still see/edit it)
  let userReview = null
  if (session?.user?.email) {
    const [own] = await db
      .select({ id: storyReviews.id, rating: storyReviews.rating, reviewText: storyReviews.reviewText, reviewerEmail: storyReviews.reviewerEmail, reviewerName: users.displayName, createdAt: storyReviews.createdAt })
      .from(storyReviews)
      .leftJoin(users, eq(storyReviews.reviewerEmail, users.email))
      .where(and(eq(storyReviews.adventureId, id), eq(storyReviews.reviewerEmail, session.user.email)))
      .limit(1)
    userReview = own ?? null
  }

  return NextResponse.json({
    reviews,
    avgRating: aggregate?.avgRating ?? null,
    totalCount: aggregate?.totalCount ?? 0,
    userReview,
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })
  }

  const { id } = await params
  const { rating, reviewText } = await req.json()

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const [adventure] = await db.select({ id: adventures.id, userEmail: adventures.userEmail })
    .from(adventures).where(eq(adventures.id, id))
  if (!adventure) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

  if (adventure.userEmail === session.user.email) {
    return NextResponse.json({ error: 'You cannot review your own story' }, { status: 403 })
  }

  await db
    .insert(storyReviews)
    .values({ adventureId: id, reviewerEmail: session.user.email, rating, reviewText: reviewText?.trim() || null })
    .onConflictDoUpdate({
      target: [storyReviews.adventureId, storyReviews.reviewerEmail],
      // Note: deliberately does NOT reset `hidden` — an admin-hidden review stays hidden after editing
      set: { rating, reviewText: reviewText?.trim() || null, updatedAt: new Date() },
    })

  return NextResponse.json({ ok: true })
}
