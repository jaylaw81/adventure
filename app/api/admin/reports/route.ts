import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { storyReports, adventures } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reports = await db
    .select({
      id: storyReports.id,
      adventureId: storyReports.adventureId,
      adventureTitle: adventures.title,
      reporterEmail: storyReports.reporterEmail,
      reason: storyReports.reason,
      details: storyReports.details,
      status: storyReports.status,
      reviewNote: storyReports.reviewNote,
      createdAt: storyReports.createdAt,
      reviewedAt: storyReports.reviewedAt,
    })
    .from(storyReports)
    .leftJoin(adventures, eq(storyReports.adventureId, adventures.id))
    .orderBy(desc(storyReports.createdAt))

  return NextResponse.json(reports)
}
