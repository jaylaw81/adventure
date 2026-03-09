import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { storyReports } from '@/lib/schema'

const VALID_STATUSES = new Set(['reviewed', 'dismissed'])

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { reportId } = await params
  const { status, reviewNote } = await req.json()

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await db
    .update(storyReports)
    .set({ status, reviewNote: reviewNote?.trim() || null, reviewedAt: new Date() })
    .where(eq(storyReports.id, reportId))

  return NextResponse.json({ ok: true })
}
