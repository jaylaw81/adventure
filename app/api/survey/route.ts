import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyResponses, surveyDismissals } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

const FOLLOWUP_DAYS = 30
const REDISPLAY_AFTER_DISMISS_DAYS = 5

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return Response.json({ shouldShow: false })
  }

  const userEmail = session.user.email
  const now = new Date()

  const [lastResponse] = await db
    .select()
    .from(surveyResponses)
    .where(eq(surveyResponses.userEmail, userEmail))
    .orderBy(desc(surveyResponses.createdAt))
    .limit(1)

  if (lastResponse) {
    const msSince = now.getTime() - lastResponse.createdAt.getTime()
    const daysSince = msSince / (1000 * 60 * 60 * 24)
    if (daysSince < FOLLOWUP_DAYS) {
      return Response.json({ shouldShow: false })
    }
    return Response.json({ shouldShow: true, surveyType: 'followup' })
  }

  const [lastDismissal] = await db
    .select()
    .from(surveyDismissals)
    .where(eq(surveyDismissals.userEmail, userEmail))
    .orderBy(desc(surveyDismissals.dismissedAt))
    .limit(1)

  if (lastDismissal && lastDismissal.nextShowAt > now) {
    return Response.json({ shouldShow: false })
  }

  return Response.json({ shouldShow: true, surveyType: 'initial' })
}
