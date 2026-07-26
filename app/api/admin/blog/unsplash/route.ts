import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface UnsplashPhoto {
  id: string
  thumb: string      // small preview URL
  regular: string    // full-size URL to store
  alt: string
  authorName: string
  authorUrl: string
  photoUrl: string   // Unsplash page URL for attribution link
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim()
  if (!query) return NextResponse.json({ error: 'Missing q param' }, { status: 400 })

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9&orientation=landscape&client_id=${key}`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return NextResponse.json({ error: 'Unsplash API error' }, { status: 502 })
  }

  const data = await res.json()

  const photos: UnsplashPhoto[] = (data.results ?? []).map((p: Record<string, unknown>) => {
    const urls = p.urls as Record<string, string>
    const user = p.user as { name: string; links: { html: string } }
    const links = p.links as { html: string }
    return {
      id: p.id as string,
      thumb: urls.small,
      regular: urls.regular,
      alt: (p.alt_description as string) ?? '',
      authorName: user.name,
      authorUrl: `${user.links.html}?utm_source=storyquestor&utm_medium=referral`,
      photoUrl: `${links.html}?utm_source=storyquestor&utm_medium=referral`,
    }
  })

  return NextResponse.json({ photos })
}
