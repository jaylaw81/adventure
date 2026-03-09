import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, storyReports } from '@/lib/schema'
import { VALID_REASONS } from '@/lib/reportReasons'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reason, details } = await req.json()

    if (!reason || !VALID_REASONS.has(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    // Verify the story exists
    const [adventure] = await db.select({ id: adventures.id }).from(adventures).where(eq(adventures.id, id))
    if (!adventure) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

    const session = await getServerSession(authOptions)
    const reporterEmail = session?.user?.email ?? null

    // Prevent duplicate reports from the same logged-in user
    if (reporterEmail) {
      const [existing] = await db
        .select({ id: storyReports.id })
        .from(storyReports)
        .where(and(eq(storyReports.adventureId, id), eq(storyReports.reporterEmail, reporterEmail)))
        .limit(1)
      if (existing) {
        return NextResponse.json({ error: 'You have already reported this story.' }, { status: 409 })
      }
    }

    await db.insert(storyReports).values({
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
