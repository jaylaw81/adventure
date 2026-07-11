import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { priceReductionOffers } from '@/lib/schema'
import PriceOfferClient from './PriceOfferClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function PricingOfferPage({ params }: Props) {
  const { token } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect(`/sign-in?next=/pricing-offer/${token}`)
  }

  const [offer] = await db
    .select()
    .from(priceReductionOffers)
    .where(
      and(
        eq(priceReductionOffers.token, token),
        eq(priceReductionOffers.userEmail, session.user.email),
      )
    )
    .limit(1)

  if (!offer) {
    return (
      <OfferMessage
        icon="🔍"
        title="Offer not found"
        body="This link doesn't match any price reduction offer on your account."
        sub="If you think this is a mistake, reach out to support."
      />
    )
  }

  if (offer.status === 'accepted') {
    return (
      <OfferMessage
        icon="✅"
        title="Already accepted"
        body={`You've already switched to the ${fmtCents(offer.offeredAmountCents)}/week plan.`}
        sub="Your account reflects the lower rate."
      />
    )
  }

  if (offer.status === 'expired' || offer.expiresAt < new Date()) {
    return (
      <OfferMessage
        icon="⏰"
        title="Offer expired"
        body="This price reduction offer has expired."
        sub="Contact support if you'd like to discuss your subscription rate."
      />
    )
  }

  return (
    <PriceOfferClient
      token={token}
      currentAmountCents={offer.currentAmountCents}
      offeredAmountCents={offer.offeredAmountCents}
      expiresAt={offer.expiresAt.toISOString()}
    />
  )
}

function fmtCents(c: number) {
  const d = c / 100
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`
}

function OfferMessage({ icon, title, body, sub }: {
  icon: string; title: string; body: string; sub: string
}) {
  return (
    <div
      className="flex items-center justify-center px-4 py-20 -mt-16"
      style={{ minHeight: 'calc(100vh + 4rem)', background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-5">{icon}</div>
        <h1 className="text-2xl font-extrabold text-white mb-3">{title}</h1>
        <p className="text-violet-300/80 mb-2 text-sm leading-relaxed">{body}</p>
        <p className="text-slate-500 text-xs">{sub}</p>
      </div>
    </div>
  )
}
