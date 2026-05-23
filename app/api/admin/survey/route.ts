import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyResponses, surveyDismissals, surveyReplies } from '@/lib/schema'
import { desc, count, eq } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [responses, allReplies, [{ dismissalCount }]] = await Promise.all([
    db.select().from(surveyResponses).orderBy(desc(surveyResponses.createdAt)),
    db.select().from(surveyReplies).orderBy(surveyReplies.sentAt),
    db.select({ dismissalCount: count() }).from(surveyDismissals),
  ])

  // Group replies by surveyResponseId
  const repliesByResponseId = allReplies.reduce<Record<string, typeof allReplies>>((acc, r) => {
    ;(acc[r.surveyResponseId] ??= []).push(r)
    return acc
  }, {})

  const responsesWithReplies = responses.map(r => ({
    ...r,
    replies: repliesByResponseId[r.id] ?? [],
  }))

  return Response.json({ responses: responsesWithReplies, dismissalCount })
}
