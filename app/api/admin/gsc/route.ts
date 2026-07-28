import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { inArray } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { isGSCConfigured, getTopStoryPages, adventureIdFromUrl } from '@/lib/gsc-data'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!isGSCConfigured()) {
    return NextResponse.json({ configured: false })
  }

  try {
    const pages = await getTopStoryPages(25)

    // Resolve adventure IDs → titles in one batch query
    const idMap = new Map<string, string>() // adventureId → page URL
    for (const p of pages) {
      const id = adventureIdFromUrl(p.page)
      if (id && !idMap.has(id)) idMap.set(id, p.page)
    }

    const ids = [...idMap.keys()]
    const titleMap = new Map<string, string>()
    if (ids.length > 0) {
      const rows = await db
        .select({ id: adventures.id, title: adventures.title })
        .from(adventures)
        .where(inArray(adventures.id, ids))
      for (const r of rows) titleMap.set(r.id, r.title)
    }

    const enriched = pages.map(p => {
      const id = adventureIdFromUrl(p.page)
      return {
        ...p,
        adventureId: id ?? null,
        title: id ? (titleMap.get(id) ?? null) : null,
      }
    })

    return NextResponse.json({ configured: true, pages: enriched })
  } catch (err) {
    console.error('[gsc] route error:', err)
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 })
  }
}
