import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id))
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { slug, title, description, publishedAt, readingMinutes, category, heroImageUrl, heroImageCredit, intro, sections, published } = body

  const [existing] = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.id, id))

  const [updated] = await db
    .update(blogPosts)
    .set({ slug, title, description, publishedAt, readingMinutes, category, heroImageUrl: heroImageUrl ?? null, heroImageCredit: heroImageCredit ?? null, intro, sections, published, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  revalidatePath('/blog')
  revalidatePath(`/blog/${updated.slug}`)
  if (existing && existing.slug !== updated.slug) revalidatePath(`/blog/${existing.slug}`)
  revalidatePath('/')

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const [deleted] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning({ slug: blogPosts.slug })

  revalidatePath('/blog')
  if (deleted) revalidatePath(`/blog/${deleted.slug}`)
  revalidatePath('/')

  return NextResponse.json({ ok: true })
}
