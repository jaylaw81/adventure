import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures } from '@/lib/schema'

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email!))
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    email: user.email,
    displayName: user.displayName,
    birthDate: user.birthDate ?? null,
    createdAt: user.createdAt,
    image: session.user.image ?? null,
  })
}

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { displayName, birthDate } = body

  if (typeof displayName !== 'string' || !displayName.trim()) {
    return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
  }
  if (birthDate !== undefined && (typeof birthDate !== 'string' || !birthDate.match(/^\d{4}-\d{2}-\d{2}$/))) {
    return NextResponse.json({ error: 'Invalid birthDate format' }, { status: 400 })
  }

  const updateData: { displayName: string; birthDate?: string } = { displayName: displayName.trim() }
  if (birthDate !== undefined) updateData.birthDate = birthDate

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.email, session.user.email!))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = session.user.email!
  // Adventures cascade-delete nodes and choices automatically
  await db.delete(adventures).where(eq(adventures.userEmail, email))
  await db.delete(users).where(eq(users.email, email))

  return NextResponse.json({ success: true })
}
