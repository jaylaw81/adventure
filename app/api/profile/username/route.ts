import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { validateUsername } from '@/lib/username'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const raw = url.searchParams.get('check') ?? ''
  const candidate = raw.trim().toLowerCase()

  const formatError = validateUsername(candidate)
  if (formatError) {
    return NextResponse.json({ available: false, reason: formatError })
  }

  const [existing] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.username, candidate))

  const available = !existing || existing.email === session.user.email
  return NextResponse.json({ available, reason: available ? undefined : 'That username is already taken.' })
}
