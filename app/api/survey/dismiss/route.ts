import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyDismissals } from '@/lib/schema'

const REDISPLAY_DAYS = 5

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return Response.json({ ok: true })
  }

  const nextShowAt = new Date()
  nextShowAt.setDate(nextShowAt.getDate() + REDISPLAY_DAYS)

  await db.insert(surveyDismissals).values({
    userEmail: session.user.email,
    nextShowAt,
  })

  return Response.json({ ok: true })
}
