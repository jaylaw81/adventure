import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const FREESOUND_BASE = 'https://freesound.org/apiv2'

// Map UI category to Freesound tag filters
const CATEGORY_FILTERS: Record<string, string> = {
  music: 'tag:music',
  ambient: 'tag:ambient',
  effects: 'tag:sfx',
}

function formatLicense(licenseUrl: string): string {
  if (licenseUrl.includes('zero') || licenseUrl.includes('CC0')) return 'CC0'
  if (licenseUrl.includes('by/') && !licenseUrl.includes('nc') && !licenseUrl.includes('nd')) return 'CC BY'
  if (licenseUrl.includes('by-nc')) return 'CC BY-NC'
  if (licenseUrl.includes('by-nd')) return 'CC BY-ND'
  return 'CC'
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.FREESOUND_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'FREESOUND_API_KEY not configured', unconfigured: true }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const category = searchParams.get('category') ?? 'all'
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  if (!q) return Response.json({ results: [], count: 0 })

  const params = new URLSearchParams({
    query: q,
    token: apiKey,
    fields: 'id,name,username,license,previews,duration,tags',
    page_size: '12',
    page: String(page),
    format: 'json',
  })

  const tagFilter = CATEGORY_FILTERS[category]
  if (tagFilter) params.set('filter', tagFilter)

  try {
    const res = await fetch(`${FREESOUND_BASE}/search/text/?${params}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return Response.json({ error: 'Freesound API error', results: [], count: 0 }, { status: 502 })
    }

    const data = await res.json()

    const results = (data.results ?? []).map((s: {
      id: number; name: string; username: string; license: string
      previews: Record<string, string>; duration: number; tags: string[]
    }) => ({
      id: s.id,
      name: s.name,
      username: s.username,
      license: formatLicense(s.license),
      previewUrl: s.previews?.['preview-hq-mp3'] ?? s.previews?.['preview-lq-mp3'] ?? null,
      duration: Math.round(s.duration),
      tags: (s.tags ?? []).slice(0, 5),
    })).filter((s: { previewUrl: string | null }) => s.previewUrl)

    return Response.json({ results, count: data.count ?? 0 })
  } catch {
    return Response.json({ error: 'Search failed', results: [], count: 0 }, { status: 502 })
  }
}
