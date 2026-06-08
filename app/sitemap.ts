import type { MetadataRoute } from 'next'
import { getPublicAdventures } from '@/lib/queries'

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
      url: `${SITE_URL}/demo`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
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

  const stories = await getPublicAdventures()

  const storyPages: MetadataRoute.Sitemap = stories.map(story => ({
    url: `${SITE_URL}/play/${story.id}`,
    lastModified: new Date(story.updatedAt ?? story.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...storyPages]
}
