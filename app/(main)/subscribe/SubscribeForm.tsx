'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, Sparkles, Zap, Heart, Gift, ArrowRight, Lock, Wand2 } from 'lucide-react'
import OnboardingProgress from '@/components/shared/OnboardingProgress'
import { formatCents, getDefaultInterval, getEnabledIntervals, intervalLabel } from '@/lib/pricing'
import type { PricingConfig, IntervalConfig } from '@/lib/pricing'

const BENEFITS = [
  { icon: Sparkles, label: 'Create unlimited branching stories', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  { icon: Zap,      label: 'Full access to the visual story editor', iconColor: 'text-violet-600', iconBg: 'bg-violet-50' },
  { icon: Heart,    label: 'Support an indie creative platform',     iconColor: 'text-teal-500',  iconBg: 'bg-teal-50' },
]

const DEFAULT_IC: IntervalConfig = { interval: 'week', enabled: true, priceCents: 200 }

interface Props {
  trialEndsAt: string | null
  gracePeriodEndsAt: string | null
  pendingFriendRewardWeeks: number
  onboarding?: boolean
  hasActiveTrial?: boolean
  pricing?: PricingConfig
  initialInterval?: string
}

export default function SubscribeForm({ trialEndsAt, gracePeriodEndsAt, pendingFriendRewardWeeks, onboarding, hasActiveTrial, pricing, initialInterval }: Props) {
  const router = useRouter()
  const { data: session } = useSession()

  const enabledIntervals = pricing ? getEnabledIntervals(pricing) : [DEFAULT_IC]
  const defaultIC = pricing ? getDefaultInterval(pricing) : DEFAULT_IC

  const [activeInterval, setActiveInterval] = useState<IntervalConfig>(() => {
    if (initialInterval) {
      return enabledIntervals.find(i => i.interval === initialInterval) ?? defaultIC
    }
    return defaultIC
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const deadlineDate = trialEndsAt
    ? new Date(trialEndsAt)
    : gracePeriodEndsAt
      ? new Date(gracePeriodEndsAt)
      : null

  const deadlineLabel = deadlineDate
    ? deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null

  const displayName = (session?.user as Record<string, string> | undefined)?.displayName
    || session?.user?.name
    || ''

  const priceLabel = `${formatCents(activeInterval.priceCents)}/${activeInterval.interval}`

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: activeInterval.interval }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }
      router.push(data.url)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center px-4 py-14 relative overflow-hidden -mt-16"
      style={{
        background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)',
        minHeight: 'calc(100vh + 4rem)',
      }}
    >
      {/* Ambient forge glow — amber top-right */}
      <div
        data-forge-glow
        className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.22) 0%, transparent 70%)',
          animation: 'forge-breathe 7s ease-in-out infinite',
          transform: 'translate(30%, -30%)',
        }}
      />
      {/* Ambient forge glow — violet bottom-left */}
      <div
        data-forge-glow
        className="absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
          animation: 'forge-breathe 9s ease-in-out infinite 2.5s',
          transform: 'translate(-35%, 35%)',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Step progress — onboarding only */}
        {onboarding && (
          <div className="mb-10">
            <OnboardingProgress step={3} theme="dark" />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)',
                animation: 'icon-glow-pulse 3s ease-in-out infinite',
              }}
            >
              <BookOpen size={28} className="text-white" strokeWidth={2} />
            </div>
          </div>

          {onboarding ? (
            <>
              <h1
                className="text-3xl font-extrabold text-white mb-2.5"
                style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
              >
                {displayName ? `Welcome, ${displayName}!` : "You're all set!"}
              </h1>
              <p className="text-violet-300/90 text-sm leading-relaxed max-w-xs mx-auto">
                {hasActiveTrial
                  ? 'Your free trial gives you full access to the story editor. Subscribe whenever you\'re ready.'
                  : 'Activate your subscription to unlock the story canvas and start creating.'}
              </p>
            </>
          ) : (
            <>
              <h1
                className="text-3xl font-extrabold text-white mb-2.5"
                style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
              >
                Unlock your story editor
              </h1>
              <p className="text-violet-300/90 text-sm leading-relaxed max-w-xs mx-auto">
                Build branching interactive stories on a visual canvas. Subscribe from {formatCents(defaultIC.priceCents)}/{defaultIC.interval}.
              </p>
            </>
          )}
        </div>

        {/* Trial escape hatch — onboarding only */}
        {onboarding && hasActiveTrial && (
          <div className="mb-5 rounded-xl overflow-hidden border border-teal-500/30" style={{ background: 'rgba(20,184,166,0.08)' }}>
            <div className="px-4 py-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-teal-300 text-sm font-semibold">
                <Wand2 size={14} className="shrink-0" />
                Your free trial is active
              </div>
              <p className="text-teal-200/70 text-xs leading-relaxed">
                You can start building stories right now
                {deadlineLabel ? ` — free access until ${deadlineLabel}` : ''}.
                Subscribe any time to keep going after your trial.
              </p>
              <Link
                href="/"
                className="mt-0.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-teal-900 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}
              >
                <Wand2 size={13} />
                Start creating now
              </Link>
            </div>
          </div>
        )}

        {/* Grace / trial notice (non-onboarding or no active trial) */}
        {deadlineLabel && !hasActiveTrial && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm text-center">
            Your free access ends on <strong>{deadlineLabel}</strong> — subscribe to keep creating.
          </div>
        )}

        {/* Friend reward weeks notice */}
        {pendingFriendRewardWeeks > 0 && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm text-center flex items-center justify-center gap-2">
            <Gift size={14} />
            <span>
              You have <strong>{pendingFriendRewardWeeks} free {pendingFriendRewardWeeks === 1 ? 'week' : 'weeks'}</strong> waiting — your friend{pendingFriendRewardWeeks > 1 ? 's' : ''} subscribed!
            </span>
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: '#ffffff' }}
        >
          {/* Amber accent top stripe */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
          />

          <div className="p-7 flex flex-col gap-6">

            {/* Benefits */}
            <div className="flex flex-col gap-2">
              {BENEFITS.map(({ icon: Icon, label, iconColor, iconBg }, i) => (
                <div
                  key={label}
                  data-benefit
                  className="flex items-center gap-3 text-sm text-gray-700"
                  style={{ animation: `benefit-enter 0.38s cubic-bezier(0.25,1,0.5,1) ${i * 0.09 + 0.1}s both` }}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={14} className={iconColor} />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100" />

            {/* Billing interval selector */}
            {enabledIntervals.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Billing frequency</p>
                <div className="flex gap-2">
                  {enabledIntervals.map(ic => (
                    <button
                      key={ic.interval}
                      onClick={() => { setActiveInterval(ic); setError('') }}
                      className={`flex-1 py-3 px-2 rounded-xl border-2 transition-colors text-center ${
                        activeInterval.interval === ic.interval
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className={`text-sm font-bold ${activeInterval.interval === ic.interval ? 'text-amber-800' : 'text-gray-700'}`}>
                        {intervalLabel(ic.interval)}
                      </div>
                      <div className={`text-xs mt-0.5 font-semibold ${activeInterval.interval === ic.interval ? 'text-amber-600' : 'text-gray-500'}`}>
                        {formatCents(ic.priceCents)}/{ic.interval}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Single interval — just show the price */}
            {enabledIntervals.length === 1 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">{intervalLabel(activeInterval.interval)} subscription</span>
                <span className="text-base font-bold text-amber-700">{priceLabel}</span>
              </div>
            )}

            {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="subscribe-cta w-full py-3.5 rounded-xl text-gray-900 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <span className="shimmer-strip" aria-hidden="true" />
              {loading ? (
                <span className="relative z-10">Redirecting to checkout…</span>
              ) : pendingFriendRewardWeeks > 0 ? (
                <span className="relative z-10">
                  Subscribe · First {pendingFriendRewardWeeks} {pendingFriendRewardWeeks === 1 ? 'week' : 'weeks'} free
                </span>
              ) : onboarding ? (
                <>
                  <span className="relative z-10">Activate · {priceLabel}</span>
                  <ArrowRight size={15} className="relative z-10 shrink-0" />
                </>
              ) : (
                <>
                  <span className="relative z-10">Start creating · {priceLabel}</span>
                  <ArrowRight size={15} className="relative z-10 shrink-0" />
                </>
              )}
            </button>

            {/* Footer trust */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Lock size={10} className="shrink-0" />
              Secure checkout via Stripe · Cancel anytime from your profile
            </div>

            {/* Demo escape hatch */}
            <p className="text-center text-xs text-gray-400">
              Want to try the editor first?{' '}
              <Link href="/demo" className="text-violet-500 hover:text-violet-700 underline underline-offset-2 font-medium transition-colors">
                Open the free demo
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
