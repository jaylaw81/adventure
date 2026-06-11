import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { emailSegments } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const segments = await db
    .select()
    .from(emailSegments)
    .orderBy(desc(emailSegments.createdAt))

  return NextResponse.json(segments.map(s => ({
    ...s,
    conditions: JSON.parse(s.conditions),
  })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, conditions } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return NextResponse.json({ error: 'At least one condition is required' }, { status: 400 })
  }

  const [segment] = await db
    .insert(emailSegments)
    .values({
      name: name.trim(),
      conditions: JSON.stringify(conditions),
      createdByEmail: session.user.email ?? 'admin',
    })
    .returning()

  return NextResponse.json({ ...segment, conditions })
}
