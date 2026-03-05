import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/explore', '/how-to', '/play/'],
        disallow: ['/create', '/edit/', '/profile', '/sign-in', '/api/'],
      },
    ],
    sitemap: 'https://www.storyquestor.com/sitemap.xml',
  }
}
