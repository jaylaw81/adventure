import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { isGSCConfigured, getStorySearchQueries } from '@/lib/gsc-data'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!isGSCConfigured()) {
    return NextResponse.json({ configured: false })
  }

  const { id } = await params

  try {
    const [story] = await db.select({ storySlug: adventures.storySlug }).from(adventures).where(eq(adventures.id, id))
    const queries = await getStorySearchQueries(id, story?.storySlug ?? null)
    return NextResponse.json({ configured: true, queries })
  } catch (err) {
    console.error('[gsc/story] route error:', err)
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 })
  }
}
