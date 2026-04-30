import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyResponses } from '@/lib/schema'

const MAX_FIELD_LENGTH = 2000

// Strips HTML tags and limits length. Returns null for empty/non-string input.
function sanitizeField(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value
    .trim()
    .replace(/<[^>]*>/g, '') // strip HTML/script tags
    .slice(0, MAX_FIELD_LENGTH)
  return cleaned || null
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { likes, dislikes, featureRequests, surveyType } = body as Record<string, unknown>

  const sanitizedLikes = sanitizeField(likes)
  const sanitizedDislikes = sanitizeField(dislikes)
  const sanitizedFeatureRequests = sanitizeField(featureRequests)

  if (!sanitizedLikes && !sanitizedDislikes && !sanitizedFeatureRequests) {
    return Response.json({ error: 'At least one field is required' }, { status: 400 })
  }

  await db.insert(surveyResponses).values({
    userEmail: session?.user?.email ?? null,
    likes: sanitizedLikes,
    dislikes: sanitizedDislikes,
    featureRequests: sanitizedFeatureRequests,
    surveyType: surveyType === 'followup' ? 'followup' : 'initial',
  })

  return Response.json({ ok: true })
}
