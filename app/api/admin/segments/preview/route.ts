import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { buildSegmentWhere, type SegmentCondition } from '@/lib/segmentQuery'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { conditions } = await req.json() as { conditions: SegmentCondition[] }

  try {
    const where = buildSegmentWhere(conditions)

    const baseWhere = and(eq(users.emailSubscribed, true), where)

    const [[countRow], sample] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(baseWhere),
      db.select({ email: users.email, displayName: users.displayName })
        .from(users)
        .where(baseWhere)
        .limit(5),
    ])

    return NextResponse.json({ count: countRow?.count ?? 0, sample })
  } catch (err) {
    console.error('[segments/preview]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
