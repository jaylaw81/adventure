import { GoogleAuth } from 'google-auth-library'

export const GSC_SITE_URL = process.env.GSC_SITE_URL ?? ''

export function isGSCConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GSC_SITE_URL)
}

interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface GSCResponse {
  rows?: GSCRow[]
}

export interface GSCPageRow {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCQueryRow {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type DimensionFilter = {
  dimension: string
  operator: string
  expression: string
}

async function callGSC(body: object): Promise<GSCResponse> {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!
  const siteUrl = GSC_SITE_URL

  const auth = new GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  const client = await auth.getClient()
  const { token } = await client.getAccessToken()

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GSC ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json() as Promise<GSCResponse>
}

// Top story pages by impressions across the whole site (last 90 days)
export async function getTopStoryPages(limit = 25): Promise<GSCPageRow[]> {
  const end = new Date()
  const start = new Date(end.getTime() - 90 * 86_400_000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const data = await callGSC({
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['page'],
    dimensionFilterGroups: [{
      filters: [{
        dimension: 'page',
        operator: 'contains',
        expression: '/play/',
      } satisfies DimensionFilter],
    }],
    orderby: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
    rowLimit: limit,
  })

  return (data.rows ?? []).map(r => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))
}

// Top search queries bringing traffic to a specific story (last 90 days)
export async function getStorySearchQueries(adventureId: string, limit = 15): Promise<GSCQueryRow[]> {
  const end = new Date()
  const start = new Date(end.getTime() - 90 * 86_400_000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const data = await callGSC({
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['query'],
    dimensionFilterGroups: [{
      filters: [{
        dimension: 'page',
        operator: 'contains',
        expression: `/play/${adventureId}`,
      } satisfies DimensionFilter],
    }],
    orderby: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
    rowLimit: limit,
  })

  return (data.rows ?? []).map(r => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))
}

// Extract adventure ID from a /play/{id} or /play/{id}/{nodeId} URL
export function adventureIdFromUrl(url: string): string | null {
  const m = url.match(/\/play\/([a-f0-9-]{36})/)
  return m ? m[1] : null
}
