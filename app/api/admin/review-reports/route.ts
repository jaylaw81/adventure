import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviewReports, storyReviews, adventures } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reports = await db
    .select({
      id: reviewReports.id,
      reviewId: reviewReports.reviewId,
      adventureId: reviewReports.adventureId,
      adventureTitle: adventures.title,
      reviewText: storyReviews.reviewText,
      reviewRating: storyReviews.rating,
      reviewHidden: storyReviews.hidden,
      reporterEmail: reviewReports.reporterEmail,
      reason: reviewReports.reason,
      details: reviewReports.details,
      status: reviewReports.status,
      reviewNote: reviewReports.reviewNote,
      createdAt: reviewReports.createdAt,
      reviewedAt: reviewReports.reviewedAt,
    })
    .from(reviewReports)
    .leftJoin(storyReviews, eq(reviewReports.reviewId, storyReviews.id))
    .leftJoin(adventures, eq(reviewReports.adventureId, adventures.id))
    .orderBy(desc(reviewReports.createdAt))

  return NextResponse.json(reports)
}
