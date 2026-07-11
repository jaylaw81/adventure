import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, inArray } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, priceReductionOffers } from '@/lib/schema'
import {
  getPricingConfig,
  savePricingConfig,
  getEnabledIntervals,
  type PricingConfig,
  type BillingInterval,
} from '@/lib/pricing'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

async function getAffectedSubscribers(config: PricingConfig) {
  const enabled = getEnabledIntervals(config)
  if (enabled.length === 0) return []

  const priceByInterval = Object.fromEntries(enabled.map(ic => [ic.interval, ic.priceCents]))

  const activeUsers = await db
    .select({
      email: users.email,
      displayName: users.displayName,
      subscriptionAmountCents: users.subscriptionAmountCents,
      subscriptionInterval: users.subscriptionInterval,
    })
    .from(users)
    .where(eq(users.subscriptionStatus, 'active'))

  // Only include users where we know their interval — never assume 'week' for null
  const eligible = activeUsers.filter(u => {
    if (!u.subscriptionInterval) return false
    const interval = u.subscriptionInterval as BillingInterval
    const price = priceByInterval[interval]
    return price !== undefined && (u.subscriptionAmountCents ?? 0) > price
  })

  if (eligible.length === 0) return []

  const emails = eligible.map(u => u.email)
  const now = new Date()

  const offers = await db
    .select()
    .from(priceReductionOffers)
    .where(inArray(priceReductionOffers.userEmail, emails))
    .orderBy(priceReductionOffers.offeredAt)

  const latestOffer = new Map<string, typeof offers[0]>()
  for (const o of offers) latestOffer.set(o.userEmail, o)

  return eligible.map(u => {
    const interval = u.subscriptionInterval as BillingInterval
    const offeredAmountCents = priceByInterval[interval] ?? 200
    const offer = latestOffer.get(u.email)
    let offerStatus: 'none' | 'pending' | 'accepted' | 'expired' = 'none'
    if (offer) {
      if (offer.status === 'accepted') offerStatus = 'accepted'
      else if (offer.expiresAt < now) offerStatus = 'expired'
      else offerStatus = 'pending'
    }
    return {
      email: u.email,
      displayName: u.displayName,
      currentAmountCents: u.subscriptionAmountCents ?? 0,
      offeredAmountCents,
      subscriptionInterval: interval,
      offerStatus,
      lastOfferedAt: offer?.offeredAt?.toISOString() ?? null,
    }
  })
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await getPricingConfig()
  const affected = await getAffectedSubscribers(config)
  return NextResponse.json({ config, affected })
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as Partial<PricingConfig>

  if (!body.defaultInterval) {
    return NextResponse.json({ error: 'defaultInterval is required' }, { status: 400 })
  }
  if (!body.displayInterval) {
    return NextResponse.json({ error: 'displayInterval is required' }, { status: 400 })
  }
  if (!Array.isArray(body.intervals) || body.intervals.length === 0) {
    return NextResponse.json({ error: 'intervals array is required' }, { status: 400 })
  }

  const enabledCount = body.intervals.filter(i => i.enabled).length
  if (enabledCount === 0) {
    return NextResponse.json({ error: 'At least one interval must be enabled' }, { status: 400 })
  }

  for (const ic of body.intervals) {
    if (!ic.enabled) continue
    if (typeof ic.priceCents !== 'number' || ic.priceCents < 50) {
      return NextResponse.json({ error: `Price for ${ic.interval} must be at least $0.50 (Stripe minimum)` }, { status: 400 })
    }
  }

  const config: PricingConfig = {
    defaultInterval: body.defaultInterval,
    displayInterval: body.displayInterval,
    intervals: body.intervals.map(ic => ({
      interval: ic.interval,
      enabled: ic.enabled,
      priceCents: ic.priceCents,
    })),
  }

  await savePricingConfig(config)

  const affected = await getAffectedSubscribers(config)
  return NextResponse.json({ config, affected })
}
