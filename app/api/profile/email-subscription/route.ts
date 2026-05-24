import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [user] = await db
    .select({ emailSubscribed: users.emailSubscribed })
    .from(users)
    .where(eq(users.email, session.user.email))

  return NextResponse.json({ emailSubscribed: user?.emailSubscribed ?? true })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { emailSubscribed } = await req.json()
  if (typeof emailSubscribed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }

  await db
    .update(users)
    .set({ emailSubscribed })
    .where(eq(users.email, session.user.email))

  return NextResponse.json({ emailSubscribed })
}
