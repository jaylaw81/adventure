import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, priceReductionOffers } from '@/lib/schema'
import { getPricingConfig, formatCents, getIntervalConfig, type BillingInterval } from '@/lib/pricing'
import { sendPriceReductionOffer } from '@/lib/email'

const OFFER_TTL_DAYS = 30

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.isAdmin ? session : null
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { emails }: { emails: string[] } = await req.json()
  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
  }

  const config = await getPricingConfig()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + OFFER_TTL_DAYS * 24 * 60 * 60 * 1000)

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const email of emails) {
    try {
      const [user] = await db
        .select({
          displayName: users.displayName,
          subscriptionAmountCents: users.subscriptionAmountCents,
          subscriptionStatus: users.subscriptionStatus,
          subscriptionInterval: users.subscriptionInterval,
          unsubscribeToken: users.unsubscribeToken,
          emailSubscribed: users.emailSubscribed,
        })
        .from(users)
        .where(eq(users.email, email))

      if (!user || user.subscriptionStatus !== 'active') {
        skipped++
        continue
      }

      if (!user.subscriptionInterval) {
        skipped++
        continue
      }
      const userInterval = user.subscriptionInterval as BillingInterval
      const ic = getIntervalConfig(config, userInterval)
      const offeredAmountCents = ic?.priceCents ?? 200

      if ((user.subscriptionAmountCents ?? 0) <= offeredAmountCents) {
        skipped++
        continue
      }

      // Cancel any existing pending offers for this user
      await db
        .update(priceReductionOffers)
        .set({ status: 'expired' })
        .where(
          and(
            eq(priceReductionOffers.userEmail, email),
            eq(priceReductionOffers.status, 'pending'),
          )
        )

      // Create new offer
      const token = crypto.randomUUID()
      await db.insert(priceReductionOffers).values({
        userEmail: email,
        currentAmountCents: user.subscriptionAmountCents ?? 0,
        offeredAmountCents,
        token,
        status: 'pending',
        offeredAt: now,
        expiresAt,
      })

      const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://www.storyquestor.com'
      await sendPriceReductionOffer({
        to: email,
        displayName: user.displayName || null,
        currentAmountCents: user.subscriptionAmountCents ?? 0,
        offeredAmountCents,
        acceptUrl: `${SITE_URL}/pricing-offer/${token}`,
        unsubscribeToken: user.unsubscribeToken ?? '',
      })

      sent++
    } catch (err) {
      errors.push(`${email}: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  return NextResponse.json({ sent, skipped, errors })
}
