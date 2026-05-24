import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyImpressionsV2, surveyAnswersV2 } from '@/lib/schema'
import { SURVEYS } from '@/lib/surveys'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [allImpressions, allAnswers] = await Promise.all([
    db.select().from(surveyImpressionsV2).orderBy(surveyImpressionsV2.shownAt),
    db.select().from(surveyAnswersV2),
  ])

  // Index answers by impressionId
  const answersByImpression: Record<string, typeof allAnswers> = {}
  for (const a of allAnswers) {
    ;(answersByImpression[a.impressionId] ??= []).push(a)
  }

  const result = SURVEYS.map(survey => {
    const impressions = allImpressions.filter(i => i.surveySlug === survey.slug)
    const completed = impressions.filter(i => i.completedAt !== null)
    const dismissed = impressions.filter(i => i.dismissedAt !== null)

    // Per-question aggregates
    const questionStats = survey.questions.map(q => {
      const answers: string[] = []
      for (const imp of completed) {
        const impAnswers = answersByImpression[imp.id] ?? []
        const a = impAnswers.find(a => a.questionKey === q.key)
        if (a) answers.push(a.answerValue)
      }

      if (q.type === 'stars') {
        const nums = answers.map(a => parseInt(a, 10)).filter(n => !isNaN(n))
        const avg = nums.length > 0 ? nums.reduce((s, n) => s + n, 0) / nums.length : null
        const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        nums.forEach(n => { if (n >= 1 && n <= 5) dist[String(n)]++ })
        return { ...q, answers, avg, dist }
      }

      if (q.type === 'nps') {
        const nums = answers.map(a => parseInt(a, 10)).filter(n => !isNaN(n))
        const promoters = nums.filter(n => n >= 9).length
        const passives = nums.filter(n => n >= 7 && n <= 8).length
        const detractors = nums.filter(n => n <= 6).length
        const total = nums.length
        const score = total > 0
          ? Math.round(((promoters - detractors) / total) * 100)
          : null
        const dist: Record<string, number> = {}
        for (let i = 0; i <= 10; i++) dist[String(i)] = nums.filter(n => n === i).length
        return { ...q, answers, score, promoters, passives, detractors, dist }
      }

      if (q.type === 'multiple_choice' || q.type === 'yes_no_maybe') {
        const options = q.type === 'yes_no_maybe' ? ['yes', 'maybe', 'no'] : (q.options ?? [])
        const dist: Record<string, number> = {}
        options.forEach(o => { dist[o] = 0 })
        answers.forEach(a => { if (a in dist) dist[a]++ })
        return { ...q, answers, dist }
      }

      // text
      return { ...q, answers }
    })

    // Responses over time (by week, last 12 weeks)
    const now = new Date()
    const weeks: { label: string; count: number }[] = []
    for (let w = 11; w >= 0; w--) {
      const start = new Date(now)
      start.setDate(start.getDate() - (w + 1) * 7)
      const end = new Date(now)
      end.setDate(end.getDate() - w * 7)
      const count = completed.filter(i => {
        const d = i.completedAt!
        return d >= start && d < end
      }).length
      weeks.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      })
    }

    return {
      slug: survey.slug,
      title: survey.title,
      shown: impressions.length,
      completed: completed.length,
      dismissed: dismissed.length,
      completionRate: impressions.length > 0 ? Math.round((completed.length / impressions.length) * 100) : 0,
      questionStats,
      weeks,
    }
  })

  return Response.json(result)
}
