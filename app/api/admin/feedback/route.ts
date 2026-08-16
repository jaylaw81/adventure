import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, desc, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteFeedback, feedbackReplies } from '@/lib/schema'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [rows, replyCounts] = await Promise.all([
    db.select().from(siteFeedback).orderBy(desc(siteFeedback.createdAt)),
    db
      .select({ feedbackId: feedbackReplies.feedbackId, count: sql<number>`count(*)::int` })
      .from(feedbackReplies)
      .groupBy(feedbackReplies.feedbackId),
  ])

  const countMap = new Map(replyCounts.map(r => [r.feedbackId, r.count]))
  return NextResponse.json(rows.map(r => ({ ...r, replyCount: countMap.get(r.id) ?? 0 })))
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, status } = body

  if (!id || !['new', 'reviewed', 'resolved'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const [updated] = await db
    .update(siteFeedback)
    .set({ status })
    .where(eq(siteFeedback.id, id))
    .returning()

  return NextResponse.json(updated)
}
