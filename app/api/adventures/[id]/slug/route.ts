import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, ne, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { requireOwner } from '@/lib/requireOwner'
import { titleToSlug, randomSuffix } from '@/lib/slugUtils'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const isMonthly = session?.user?.subscriptionInterval === 'month'
  const isAdmin = !!session?.user?.isAdmin
  if (!isMonthly && !isAdmin) {
    return NextResponse.json({ error: 'Custom URLs require a monthly subscription' }, { status: 403 })
  }

  const { id } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  const [adventure] = await db
    .select({ title: adventures.title })
    .from(adventures)
    .where(eq(adventures.id, id))
  if (!adventure) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const baseSlug = titleToSlug(adventure.title)

  async function isSlugTaken(candidate: string): Promise<boolean> {
    const rows = await db
      .select({ id: adventures.id })
      .from(adventures)
      .where(and(eq(adventures.storySlug, candidate), ne(adventures.id, id)))
      .limit(1)
    return rows.length > 0
  }

  let slug = baseSlug
  if (await isSlugTaken(slug)) {
    let found = false
    for (let i = 2; i <= 9; i++) {
      const candidate = `${baseSlug}-${i}`
      if (!await isSlugTaken(candidate)) {
        slug = candidate
        found = true
        break
      }
    }
    if (!found) slug = `${baseSlug}-${randomSuffix()}`
  }

  await db.update(adventures).set({ storySlug: slug, updatedAt: new Date() }).where(eq(adventures.id, id))
  return NextResponse.json({ slug })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const isMonthly = session?.user?.subscriptionInterval === 'month'
  const isAdmin = !!session?.user?.isAdmin
  if (!isMonthly && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  await db.update(adventures).set({ storySlug: null, updatedAt: new Date() }).where(eq(adventures.id, id))
  return NextResponse.json({ success: true })
}
