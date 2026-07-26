import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '1'), 10)

  const posts = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      category: blogPosts.category,
      readingMinutes: blogPosts.readingMinutes,
      publishedAt: blogPosts.publishedAt,
      heroImageUrl: blogPosts.heroImageUrl,
    })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)

  return NextResponse.json(posts)
}
