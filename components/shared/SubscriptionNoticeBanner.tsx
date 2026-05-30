'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'

interface BillingStatus {
  tier: string
  grandfathered: boolean
  subscriptionStatus: string | null
  trialEndsAt: string | null
  gracePeriodEndsAt: string | null
  canCreate: boolean
}

function daysRemaining(dateStr: string): number {
  const ms = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function SubscriptionNoticeBanner() {
  const { data: session, status } = useSession()
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return
    const key = `sq_sub_notice_${session.user.email}_${new Date().toISOString().slice(0, 10)}`
    if (sessionStorage.getItem(key)) return // already dismissed today

    fetch('/api/billing/status')
      .then(r => r.json())
      .then((data: BillingStatus) => {
        if (data.grandfathered) return
        if (data.tier === 'organization') return // org billing comes later
        if (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing') return
        if (!data.canCreate) return // already locked — the page gate handles this
        setBilling(data)
        setDismissed(false)
      })
      .catch(() => {})
  }, [status, session?.user?.email])

  const dismiss = () => {
    if (!session?.user?.email) return
    const key = `sq_sub_notice_${session.user.email}_${new Date().toISOString().slice(0, 10)}`
    sessionStorage.setItem(key, '1')
    setDismissed(true)
  }

  if (dismissed || !billing) return null

  const deadline = billing.trialEndsAt ?? billing.gracePeriodEndsAt
  const days = deadline ? daysRemaining(deadline) : null

  return (
    <div
      className="relative z-20 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap text-sm"
      style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #f59e0b)' }}
    >
      <div className="flex items-center gap-2 text-white min-w-0">
        <Sparkles size={14} className="shrink-0 opacity-90" />
        <p className="leading-snug">
          <strong>StoryQuestor is moving to a subscription model.</strong>
          {days !== null && days > 0
            ? ` You have ${days} day${days === 1 ? '' : 's'} of free access remaining.`
            : ' Your free access period has ended.'}
          {' '}Creating and editing stories will require a subscription.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/subscribe"
          className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors border border-white/30 whitespace-nowrap"
        >
          Subscribe from $2/mo
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
