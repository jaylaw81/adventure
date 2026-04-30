import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationWaitlist } from '@/lib/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const entries = await db
    .select()
    .from(organizationWaitlist)
    .orderBy(desc(organizationWaitlist.createdAt))

  return Response.json(entries)
}
