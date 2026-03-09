import { NextResponse } from 'next/server'
import { getPublicAdventures } from '@/lib/queries'

// Cache for 60 s at the CDN/edge; serve stale up to 5 min while revalidating
export const revalidate = 60

export async function GET() {
  try {
    const stories = await getPublicAdventures()
    return NextResponse.json(stories, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
