import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isNull, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { getAdventures } from '@/lib/queries'

const ORIGINAL_OWNER = 'jaylaw81@gmail.com'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const email = session.user.email

    // Claim all unowned adventures for the original owner on first login
    if (email === ORIGINAL_OWNER) {
      await db
        .update(adventures)
        .set({ userEmail: ORIGINAL_OWNER })
        .where(isNull(adventures.userEmail))
    }

    const all = await getAdventures(email)
    return NextResponse.json(all)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch adventures' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { title, description } = body
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const [adventure] = await db
      .insert(adventures)
      .values({ title, description: description ?? '', userEmail: session.user.email })
      .returning()
    return NextResponse.json(adventure, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create adventure' }, { status: 500 })
  }
}
