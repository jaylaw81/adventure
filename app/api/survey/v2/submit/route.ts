import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyImpressionsV2, surveyAnswersV2 } from '@/lib/schema'
import { getSurvey } from '@/lib/surveys'
import { eq } from 'drizzle-orm'

const MAX_TEXT_LENGTH = 2000

function sanitize(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim().replace(/<[^>]*>/g, '').slice(0, MAX_TEXT_LENGTH)
  return s || null
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Bad request' }, { status: 400 }) }
  if (typeof body !== 'object' || body === null) return Response.json({ error: 'Bad request' }, { status: 400 })

  const { impressionId, answers } = body as Record<string, unknown>
  if (typeof impressionId !== 'string' || typeof answers !== 'object' || answers === null) {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  // Verify the impression belongs to this user
  const [impression] = await db
    .select()
    .from(surveyImpressionsV2)
    .where(eq(surveyImpressionsV2.id, impressionId))
    .limit(1)

  if (!impression) return Response.json({ error: 'Not found' }, { status: 404 })
  if (session?.user?.email && impression.userEmail !== session.user.email) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const survey = getSurvey(impression.surveySlug)
  if (!survey) return Response.json({ error: 'Unknown survey' }, { status: 400 })

  const answersMap = answers as Record<string, unknown>

  // Validate required questions
  for (const q of survey.questions) {
    if (q.required && !answersMap[q.key]) {
      return Response.json({ error: `Missing required answer: ${q.key}` }, { status: 400 })
    }
  }

  // Insert answers
  const answerRows = Object.entries(answersMap)
    .map(([key, val]) => ({ key, value: sanitize(val) }))
    .filter(({ value }) => value !== null)
    .map(({ key, value }) => ({
      impressionId,
      questionKey: key,
      answerValue: value!,
    }))

  if (answerRows.length > 0) {
    await db.insert(surveyAnswersV2).values(answerRows)
  }

  await db
    .update(surveyImpressionsV2)
    .set({ completedAt: new Date() })
    .where(eq(surveyImpressionsV2.id, impressionId))

  return Response.json({ ok: true })
}
