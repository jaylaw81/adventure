import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'
import { seedBlogPostsIfEmpty } from '@/lib/blogSeed'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await seedBlogPostsIfEmpty()

  const posts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt))

  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { slug, title, description, publishedAt, readingMinutes, category, heroImageUrl, heroImageCredit, intro, sections, published } = body

  if (!slug || !title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
  }

  const [post] = await db
    .insert(blogPosts)
    .values({ slug, title, description, publishedAt, readingMinutes, category, heroImageUrl: heroImageUrl ?? null, heroImageCredit: heroImageCredit ?? null, intro, sections, published })
    .returning()

  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/')

  return NextResponse.json(post)
}
