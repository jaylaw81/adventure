import type { MetadataRoute } from 'next'
import { getPublicAdventures } from '@/lib/queries'

const SITE_URL = 'https://www.storyquestor.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/how-to`,
      changeFrequency: 'monthly',
      priority: 0.7,
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
