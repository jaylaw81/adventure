import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { funnelEvents } from '@/lib/schema'

export type FunnelEvent =
  | 'free_limit_hit'
  | 'pricing_viewed'
  | 'subscribe_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_expired'

/** Records an upgrade-funnel step. Never throws: analytics must not break the page or webhook. */
export async function logFunnelEvent(event: FunnelEvent, userEmail: string, detail?: string | null) {
  try {
    // Next.js prefetches linked pages; only a real visit should count
    const h = await headers().catch(() => null)
    if (h?.get('next-router-prefetch') || h?.get('next-router-segment-prefetch')) return
    await db.insert(funnelEvents).values({ event, userEmail, detail: detail ?? null })
  } catch (err) {
    console.error('Funnel event failed:', event, err)
  }
}
