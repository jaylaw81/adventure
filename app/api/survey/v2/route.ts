import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyImpressionsV2 } from '@/lib/schema'
import { SURVEYS } from '@/lib/surveys'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session.user.profileComplete) {
    return Response.json({ shouldShow: false })
  }

  const userEmail = session.user.email
  const now = new Date()

  // Load all impressions for this user
  const impressions = await db
    .select()
    .from(surveyImpressionsV2)
    .where(eq(surveyImpressionsV2.userEmail, userEmail))
    .orderBy(desc(surveyImpressionsV2.shownAt))

  // Pick the survey with the highest priority to show
  for (const survey of SURVEYS) {
    const surveyImpressions = impressions.filter(i => i.surveySlug === survey.slug)

    const lastCompleted = surveyImpressions.find(i => i.completedAt !== null)
    if (lastCompleted?.completedAt) {
      const daysSince = (now.getTime() - lastCompleted.completedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < survey.minDaysBetweenShows) continue
    }

    const lastDismissed = surveyImpressions.find(i => i.dismissedAt !== null)
    if (lastDismissed?.dismissedAt) {
      const daysSince = (now.getTime() - lastDismissed.dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < survey.dismissCooldownDays) continue
    }

    // Create the impression record now (before the modal appears)
    const [impression] = await db
      .insert(surveyImpressionsV2)
      .values({ surveySlug: survey.slug, userEmail })
      .returning({ id: surveyImpressionsV2.id })

    return Response.json({
      shouldShow: true,
      impressionId: impression.id,
      survey,
    })
  }

  return Response.json({ shouldShow: false })
}
