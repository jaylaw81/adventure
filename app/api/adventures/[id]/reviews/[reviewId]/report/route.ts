import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { storyReviews, reviewReports, adventures } from '@/lib/schema'
import { VALID_REVIEW_REPORT_REASONS } from '@/lib/reviewReportReasons'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id, reviewId } = await params
    const { reason, details } = await req.json()

    if (!reason || !VALID_REVIEW_REPORT_REASONS.has(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    // Verify story is public before allowing any report
    const [adventure] = await db.select({ isPublic: adventures.isPublic }).from(adventures).where(eq(adventures.id, id)).limit(1)
    if (!adventure?.isPublic) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [review] = await db
      .select({ id: storyReviews.id, adventureId: storyReviews.adventureId })
      .from(storyReviews)
      .where(and(eq(storyReviews.id, reviewId), eq(storyReviews.adventureId, id)))
      .limit(1)

    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    const session = await getServerSession(authOptions)
    const reporterEmail = session?.user?.email ?? null

    // Prevent duplicate reports from the same logged-in user
    if (reporterEmail) {
      const [existing] = await db
        .select({ id: reviewReports.id })
        .from(reviewReports)
        .where(and(eq(reviewReports.reviewId, reviewId), eq(reviewReports.reporterEmail, reporterEmail)))
        .limit(1)
      if (existing) {
        return NextResponse.json({ error: 'You have already reported this review.' }, { status: 409 })
      }
    }

    await db.insert(reviewReports).values({
      reviewId,
      adventureId: id,
      reporterEmail,
      reason,
      details: details?.trim() || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
