import { NextResponse } from 'next/server'
import { getPublicAdventures } from '@/lib/queries'

export async function GET() {
  try {
    const stories = await getPublicAdventures()
    return NextResponse.json(stories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
