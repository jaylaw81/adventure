import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyResponses, surveyDismissals } from '@/lib/schema'
import { desc, count } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [responses, [{ dismissalCount }]] = await Promise.all([
    db.select().from(surveyResponses).orderBy(desc(surveyResponses.createdAt)),
    db.select({ dismissalCount: count() }).from(surveyDismissals),
  ])

  return Response.json({ responses, dismissalCount })
}
