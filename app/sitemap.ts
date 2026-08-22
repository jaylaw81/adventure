import type { MetadataRoute } from 'next'
import { eq, desc } from 'drizzle-orm'
import { getPublicAdventures, getAllPublicTags } from '@/lib/queries'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'

const SITE_URL = 'https://www.storyquestor.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/how-to`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/what-is-interactive-fiction`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/how-to-write-branching-stories`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/how-to-create-meaningful-choices`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/how-to-write-multiple-endings`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/branching-story-structure`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/interactive-fiction-genres`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/resources/choose-your-own-adventure-history`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/resources/interactive-fiction-history`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/resources/text-adventure-history`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/resources/visual-novels-guide`,
      lastModified: new Date('2026-08-22'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/demo`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const [stories, tags, posts] = await Promise.all([
    getPublicAdventures(),
    getAllPublicTags(),
    db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.updatedAt)),
  ])

  const storyPages: MetadataRoute.Sitemap = stories.map(story => ({
    url: `${SITE_URL}/play/${story.id}`,
    lastModified: new Date(story.updatedAt ?? story.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const tagPages: MetadataRoute.Sitemap = tags.map(tag => ({
    url: `${SITE_URL}/explore/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const blogPostPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...storyPages, ...tagPages, ...blogPostPages]
}
