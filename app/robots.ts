import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/explore', '/how-to', '/demo', '/privacy', '/terms', '/play/', '/s/'],
        disallow: ['/create', '/edit/', '/profile', '/sign-in', '/sign-up', '/reset-password', '/subscribe', '/api/', '/admin/', '/org/'],
      },
    ],
    sitemap: 'https://www.storyquestor.com/sitemap.xml',
  }
}
