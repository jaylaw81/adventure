import { NextResponse } from 'next/server'
import { getAdventureWithData } from '@/lib/queries'
import { requireOwner } from '@/lib/requireOwner'
import { canCreateStories } from '@/lib/subscription'
import { titleToSlug } from '@/lib/slugUtils'
import { buildTwineHtml } from '@/lib/twineExport'

// GET /api/adventures/[id]/export/twine — download the story as a Twine 2 HTML file (paid plans).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const owned = await requireOwner(id)
    if (owned.error) return owned.error

    if (!await canCreateStories(owned.email)) {
      return NextResponse.json(
        { error: 'Exporting to Twine requires a paid plan.', code: 'subscription_required' },
        { status: 402 },
      )
    }

    const adventure = await getAdventureWithData(id)
    if (!adventure) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (adventure.nodes.length === 0) {
      return NextResponse.json({ error: 'This story has no scenes to export.' }, { status: 400 })
    }

    const html = buildTwineHtml({
      adventure,
      chapters: adventure.chapters,
      nodes: adventure.nodes,
      choices: adventure.choices,
    })

    const filename = `${titleToSlug(adventure.title) || 'story'}-twine.html`
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to export story' }, { status: 500 })
  }
}
