import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getIncomingFollowRequests, getDeniedFollowRequests } from '@/lib/queries'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const requests = searchParams.get('status') === 'denied'
    ? await getDeniedFollowRequests(session.user.email)
    : await getIncomingFollowRequests(session.user.email)
  return NextResponse.json(requests)
}
