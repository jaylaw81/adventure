import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSurveys } from '@/lib/getSurveys'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const surveys = await getSurveys()
  return Response.json(surveys)
}
