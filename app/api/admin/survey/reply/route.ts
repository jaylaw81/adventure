import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyResponses, surveyReplies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sendSurveyReply } from '@/lib/email'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { responseId, subject, message } = body as Record<string, string>

  if (!responseId || !subject?.trim() || !message?.trim()) {
    return Response.json({ error: 'responseId, subject, and message are required' }, { status: 400 })
  }

  const [response] = await db
    .select()
    .from(surveyResponses)
    .where(eq(surveyResponses.id, responseId))
    .limit(1)

  if (!response) {
    return Response.json({ error: 'Survey response not found' }, { status: 404 })
  }

  if (!response.userEmail) {
    return Response.json({ error: 'This response is anonymous — no email to reply to' }, { status: 400 })
  }

  await sendSurveyReply({
    to: response.userEmail,
    subject: subject.trim(),
    message: message.trim(),
    originalFeedback: {
      likes: response.likes,
      dislikes: response.dislikes,
      featureRequests: response.featureRequests,
    },
  })

  const [saved] = await db
    .insert(surveyReplies)
    .values({
      surveyResponseId: responseId,
      sentByEmail: session.user.email!,
      subject: subject.trim(),
      message: message.trim(),
    })
    .returning()

  return Response.json({ ok: true, reply: saved })
}
