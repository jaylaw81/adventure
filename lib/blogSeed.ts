import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'
import { staticBlogPosts } from '@/lib/blogPosts'
import { sql } from 'drizzle-orm'

export async function seedBlogPostsIfEmpty() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)

  if (Number(count) > 0) return

  await db.insert(blogPosts).values(
    staticBlogPosts.map(p => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      publishedAt: p.publishedAt,
      readingMinutes: p.readingMinutes,
      category: p.category,
      intro: p.intro,
      sections: p.sections,
      published: true,
    }))
  ).onConflictDoNothing()
}
