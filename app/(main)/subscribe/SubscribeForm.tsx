'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, Sparkles, Zap, Heart, Gift, ArrowRight, Lock } from 'lucide-react'
import OnboardingProgress from '@/components/shared/OnboardingProgress'

const PRESETS = [
  { cents: 200, label: '$2' },
  { cents: 500, label: '$5', badge: 'Popular' },
  { cents: 1000, label: '$10' },
  { cents: 2000, label: '$20' },
]

const BENEFITS = [
  { icon: Sparkles, label: 'Create unlimited branching stories', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  { icon: Zap,      label: 'Full access to the visual story editor', iconColor: 'text-violet-600', iconBg: 'bg-violet-50' },
  { icon: Heart,    label: 'Support an indie creative platform',     iconColor: 'text-teal-500',  iconBg: 'bg-teal-50' },
]

interface Props {
  trialEndsAt: string | null
  gracePeriodEndsAt: string | null
  pendingFriendRewardWeeks: number
  onboarding?: boolean
}

export default function SubscribeForm({ trialEndsAt, gracePeriodEndsAt, pendingFriendRewardWeeks, onboarding }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [selected, setSelected] = useState<number>(500)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amountCents = useCustom
    ? Math.round(parseFloat(custom || '0') * 100)
    : selected

  const amountDollars = (amountCents / 100).toFixed(2)
  const valid = amountCents >= 200

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

  async function handleSubscribe() {
    if (!valid) { setError('Minimum amount is $2.00'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents }),
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
          {/* Icon orb */}
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
                {displayName ? `Almost there, ${displayName}!` : 'Almost there!'}
              </h1>
              <p className="text-violet-300/90 text-sm leading-relaxed max-w-xs mx-auto">
                Activate your subscription to unlock the story canvas and start creating.
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
                Build branching interactive stories on a visual canvas. Pay what feels right — everything unlocks from $2/week.
              </p>
            </>
          )}
        </div>

        {/* Grace / trial notice */}
        {deadlineLabel && (
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
          {/* Amber accent top stripe — earned by being the acquisition card */}
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

            {/* Amount picker */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Choose your weekly amount</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESETS.map(({ cents, label, badge }) => {
                  const isSelected = !useCustom && selected === cents
                  return (
                    <button
                      key={cents}
                      onClick={() => { setSelected(cents); setUseCustom(false); setError('') }}
                      className={`amount-btn relative py-2.5 rounded-xl border-2 text-sm font-bold ${
                        isSelected ? 'amount-btn-selected' : 'border-gray-200 text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {badge && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide bg-amber-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {badge}
                        </span>
                      )}
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Custom amount */}
              <button
                onClick={() => { setUseCustom(true); setError('') }}
                className={`amount-btn w-full text-sm py-2 rounded-xl border-2 font-medium ${
                  useCustom
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-dashed border-gray-300 text-gray-500 hover:border-amber-300 hover:text-amber-700'
                }`}
              >
                {useCustom ? 'Custom amount' : '+ Enter custom amount'}
              </button>

              {useCustom && (
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                  <input
                    type="number"
                    min="2"
                    step="1"
                    value={custom}
                    onChange={e => { setCustom(e.target.value); setError('') }}
                    placeholder="2"
                    autoFocus
                    className="w-full pl-7 pr-12 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">/week</span>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={loading || !valid}
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
                  <span className="relative z-10">Activate · ${amountDollars}/week</span>
                  <ArrowRight size={15} className="relative z-10 shrink-0" />
                </>
              ) : (
                <>
                  <span className="relative z-10">Start creating · ${amountDollars}/week</span>
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
