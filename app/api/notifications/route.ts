import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRecentNotifications, getUnreadNotificationCount } from '@/lib/queries'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    getRecentNotifications(session.user.email),
    getUnreadNotificationCount(session.user.email),
  ])

  return NextResponse.json({ notifications, unreadCount })
}
