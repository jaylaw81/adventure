import { NextResponse } from 'next/server'
import { getExploreStories } from '@/lib/exploreData'

export async function GET() {
  try {
    const stories = await getExploreStories()
    return NextResponse.json(stories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
