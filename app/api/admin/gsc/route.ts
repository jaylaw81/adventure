import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { inArray, or } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { isGSCConfigured, getTopStoryPages, adventureIdFromUrl, storySlugFromUrl } from '@/lib/gsc-data'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!isGSCConfigured()) {
    return NextResponse.json({ configured: false })
  }

  try {
    const pages = await getTopStoryPages(25)

    // Resolve /play/{id} and /story/{slug} pages → adventure IDs and titles in one batch query
    const ids = [...new Set(pages.map(p => adventureIdFromUrl(p.page)).filter((x): x is string => !!x))]
    const slugs = [...new Set(pages.map(p => storySlugFromUrl(p.page)).filter((x): x is string => !!x))]
    const titleMap = new Map<string, string>()
    const slugToId = new Map<string, string>()
    if (ids.length > 0 || slugs.length > 0) {
      const rows = await db
        .select({ id: adventures.id, title: adventures.title, storySlug: adventures.storySlug })
        .from(adventures)
        .where(or(
          ids.length > 0 ? inArray(adventures.id, ids) : undefined,
          slugs.length > 0 ? inArray(adventures.storySlug, slugs) : undefined,
        ))
      for (const r of rows) {
        titleMap.set(r.id, r.title)
        if (r.storySlug) slugToId.set(r.storySlug, r.id)
      }
    }

    const enriched = pages.map(p => {
      const slug = storySlugFromUrl(p.page)
      const id = adventureIdFromUrl(p.page) ?? (slug ? slugToId.get(slug) ?? null : null)
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
