import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviewReports, storyReviews } from '@/lib/schema'

const VALID_STATUSES = new Set(['reviewed', 'dismissed'])

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { reportId } = await params
  const { status, reviewNote, hideReview } = await req.json()

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Get the report to find the reviewId
  const [report] = await db
    .select({ reviewId: reviewReports.reviewId })
    .from(reviewReports)
    .where(eq(reviewReports.id, reportId))
    .limit(1)

  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const ops: Promise<unknown>[] = [
    db
      .update(reviewReports)
      .set({ status, reviewNote: reviewNote?.trim() || null, reviewedAt: new Date() })
      .where(eq(reviewReports.id, reportId)),
  ]

  // Optionally hide the review — it stays in the DB but is excluded from display and scoring
  if (hideReview) {
    ops.push(
      db.update(storyReviews).set({ hidden: true }).where(eq(storyReviews.id, report.reviewId))
    )
  }

  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
