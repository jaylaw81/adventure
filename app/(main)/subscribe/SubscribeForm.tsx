'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, Sparkles, Gift, ArrowRight, Lock, Wand2, Check, Music, Globe, Tag, Star, Sword, Users } from 'lucide-react'
import OnboardingProgress from '@/components/shared/OnboardingProgress'
import { formatCents, getDefaultInterval, getEnabledIntervals } from '@/lib/pricing'
import type { PricingConfig, IntervalConfig } from '@/lib/pricing'

const FEATURES: {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  free: boolean
  weekly: boolean
  monthly: boolean
}[] = [
  { label: 'Visual story canvas',              icon: BookOpen, free: true,  weekly: true,  monthly: true  },
  { label: 'Unlimited scenes & branches',       icon: Sparkles, free: true,  weekly: true,  monthly: true  },
  { label: 'World Builder RPG system',          icon: Sword,    free: false, weekly: true,  monthly: true  },
  { label: 'Characters, items & foe combat',    icon: Users,    free: false, weekly: true,  monthly: true  },
  { label: 'Publish stories publicly',          icon: Globe,    free: true,  weekly: true,  monthly: true  },
  { label: 'Private stories',                   icon: Lock,     free: false, weekly: true,  monthly: true  },
  { label: 'Tags & audience controls',          icon: Tag,      free: false, weekly: true,  monthly: true  },
  { label: 'Story ratings & reviews',           icon: Star,     free: true,  weekly: true,  monthly: true  },
  { label: 'Scene image generation',            icon: Sparkles, free: false, weekly: false, monthly: true  },
  { label: 'Character portraits',               icon: Sparkles, free: false, weekly: false, monthly: true  },
  { label: 'Scene soundscapes',                 icon: Music,    free: false, weekly: false, monthly: true  },
]

const PREMIUM_START = 8

// Floating background particles — amber/violet/white
const SPARKS: { size: number; left: string; top: string; color: string; dur: number; delay: number }[] = [
  { size: 3, left: '7%',  top: '30%', color: 'rgba(245,158,11,0.75)', dur: 7.2,  delay: 0   },
  { size: 2, left: '17%', top: '58%', color: 'rgba(167,139,250,0.6)', dur: 9.5,  delay: 1.4 },
  { size: 4, left: '31%', top: '22%', color: 'rgba(255,255,255,0.4)', dur: 8.0,  delay: 2.2 },
  { size: 2, left: '48%', top: '72%', color: 'rgba(245,158,11,0.55)', dur: 6.8,  delay: 0.7 },
  { size: 3, left: '63%', top: '40%', color: 'rgba(167,139,250,0.6)', dur: 10.1, delay: 3.1 },
  { size: 2, left: '76%', top: '25%', color: 'rgba(255,255,255,0.38)',dur: 7.7,  delay: 1.8 },
  { size: 4, left: '86%', top: '62%', color: 'rgba(245,158,11,0.65)', dur: 8.9,  delay: 0.3 },
  { size: 2, left: '93%', top: '35%', color: 'rgba(167,139,250,0.5)', dur: 9.2,  delay: 2.6 },
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

export default function SubscribeForm({
  trialEndsAt,
  gracePeriodEndsAt,
  pendingFriendRewardWeeks,
  onboarding,
  hasActiveTrial,
  pricing,
  initialInterval,
}: Props) {
  const router = useRouter()
  const { data: session } = useSession()

  const enabledIntervals = pricing ? getEnabledIntervals(pricing) : [DEFAULT_IC]
  const defaultIC = pricing ? getDefaultInterval(pricing) : DEFAULT_IC

  const weeklyIC  = enabledIntervals.find(i => i.interval === 'week')  ?? null
  const monthlyIC = enabledIntervals.find(i => i.interval === 'month') ?? null

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState('')

  const deadlineDate = trialEndsAt
    ? new Date(trialEndsAt)
    : gracePeriodEndsAt
      ? new Date(gracePeriodEndsAt)
      : null

  const deadlineLabel = deadlineDate
    ? deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null

  const displayName =
    (session?.user as Record<string, string> | undefined)?.displayName ||
    session?.user?.name ||
    ''

  const weeklyPrice  = weeklyIC  ? formatCents(weeklyIC.priceCents)  : '$2'
  const monthlyPrice = monthlyIC ? formatCents(monthlyIC.priceCents) : '$8'

  const paidCount  = (weeklyIC ? 1 : 0) + (monthlyIC ? 1 : 0)
  const gridCols   = paidCount === 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  async function handleSubscribe(interval: string) {
    setLoading(interval)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong')
        setLoading(null)
        return
      }
      router.push(data.url)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div
      className="flex flex-col items-center px-4 pt-28 pb-16 relative overflow-hidden -mt-16"
      style={{
        background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)',
        minHeight: 'calc(100vh + 4rem)',
      }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 right-0 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.13) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
          animation: 'forge-breathe 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          transform: 'translate(-30%, 35%)',
          animation: 'forge-breathe 10s ease-in-out infinite 3s',
        }}
      />

      {/* Floating sparks */}
      {SPARKS.map((s, i) => (
        <span
          key={i}
          data-spark=""
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            left: s.left,
            top: s.top,
            background: s.color,
            animation: `spark-drift ${s.dur}s ease-in-out infinite ${s.delay}s`,
          }}
        />
      ))}

      <div className="w-full max-w-3xl relative z-10">

        {/* Onboarding progress */}
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
            {/* Orbiting accent dot */}
            <span
              className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                transform: 'translate(30%, -30%)',
                animation: 'sparkle-float 2.8s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(245,158,11,0.6)',
              }}
            >
              <Star size={8} className="text-white fill-white" />
            </span>
          </div>

          {onboarding ? (
            <>
              <h1
                className="text-3xl font-extrabold text-white mb-2.5"
                style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
              >
                {displayName ? `Welcome, ${displayName}!` : "You're all set!"}
              </h1>
              <p className="text-violet-300/90 text-sm leading-relaxed max-w-sm mx-auto">
                {hasActiveTrial
                  ? "Your free trial gives you full access. Subscribe whenever you're ready — or start creating now."
                  : 'Choose a plan and start telling your story. You can upgrade or change any time.'}
              </p>
            </>
          ) : (
            <>
              <h1
                className="text-3xl font-extrabold text-white mb-2.5"
                style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
              >
                Choose your plan
              </h1>
              <p className="text-violet-300/90 text-sm leading-relaxed max-w-sm mx-auto">
                Start free with one story, or unlock the full editor from {weeklyPrice}/week.
              </p>
            </>
          )}
        </div>

        {/* Trial active notice */}
        {onboarding && hasActiveTrial && (
          <div
            className="mb-6 rounded-xl overflow-hidden border border-teal-500/30 max-w-lg mx-auto"
            style={{ background: 'rgba(20,184,166,0.08)' }}
          >
            <div className="px-4 py-3.5 flex items-center gap-3">
              <Wand2 size={14} className="text-teal-300 shrink-0" />
              <p className="text-teal-200/80 text-xs leading-relaxed flex-1">
                <span className="font-semibold text-teal-300">Trial active</span>
                {deadlineLabel ? ` — full access until ${deadlineLabel}.` : '.'}
                {' '}Subscribe any time to keep going after your trial.
              </p>
              <Link
                href="/"
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-900 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}
              >
                Start now
              </Link>
            </div>
          </div>
        )}

        {/* Grace / deadline notice */}
        {deadlineLabel && !hasActiveTrial && (
          <div className="mb-6 max-w-lg mx-auto px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm text-center">
            Your free access ends on <strong>{deadlineLabel}</strong> — subscribe to keep creating.
          </div>
        )}

        {/* Friend reward notice */}
        {pendingFriendRewardWeeks > 0 && (
          <div className="mb-6 max-w-lg mx-auto px-4 py-3 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm text-center flex items-center justify-center gap-2">
            <Gift size={14} />
            <span>
              You have <strong>{pendingFriendRewardWeeks} free {pendingFriendRewardWeeks === 1 ? 'week' : 'weeks'}</strong> waiting — your friend{pendingFriendRewardWeeks > 1 ? 's' : ''} subscribed!
            </span>
          </div>
        )}

        {/* ── Plan cards ── */}
        <div className={`grid grid-cols-1 ${gridCols} gap-4 mb-10`}>

          {/* Free */}
          <div
            data-plan-card=""
            className="rounded-xl p-5 flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              animation: 'plan-card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
              animationDelay: '0.05s',
            }}
          >
            <p className="text-sm font-semibold text-white/40 mb-5">Free</p>
            <div className="mb-1">
              <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>$0</span>
            </div>
            <p className="text-sm text-white/30 mb-6">forever</p>
            <p className="text-xs text-white/45 mb-6 leading-relaxed flex-1">
              Build your first story with the Block Builder and share it with the world.
            </p>
            <Link
              href="/"
              className="block w-full py-2.5 rounded-lg text-xs font-semibold text-white/55 border border-white/20 hover:text-white/75 hover:border-white/30 hover:bg-white/5 transition-all text-center"
            >
              Continue for free
            </Link>
          </div>

          {/* Weekly */}
          {weeklyIC && (
            <div
              data-plan-card=""
              className="rounded-xl p-5 flex flex-col"
              style={{
                background: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.22)',
                animation: 'plan-card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
                animationDelay: '0.17s',
              }}
            >
              <p className="text-sm font-semibold text-amber-400/80 mb-5">Weekly</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>
                  {weeklyPrice}
                </span>
              </div>
              <p className="text-sm text-amber-400/45 mb-6">per week</p>
              <p className="text-xs text-white/45 mb-6 leading-relaxed flex-1">
                All editors. Unlimited stories. Public and private. Full creative control.
              </p>
              <button
                onClick={() => handleSubscribe('week')}
                disabled={loading !== null}
                className="subscribe-cta w-full py-2.5 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
              >
                <span className="shimmer-strip" />
                {loading === 'week'
                  ? 'Redirecting…'
                  : pendingFriendRewardWeeks > 0
                    ? `Subscribe · ${pendingFriendRewardWeeks}wk free`
                    : 'Start weekly'}
              </button>
            </div>
          )}

          {/* Monthly */}
          {monthlyIC && (
            <div
              data-plan-card=""
              data-monthly-card=""
              className="rounded-xl flex flex-col overflow-hidden"
              style={{
                background: 'rgba(124,58,237,0.13)',
                animation: weeklyIC
                  ? 'plan-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.29s both, monthly-glow-pulse 4s ease-in-out 0.85s infinite'
                  : 'plan-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.17s both, monthly-glow-pulse 4s ease-in-out 0.68s infinite',
              }}
            >
              {/* Gradient top accent strip */}
              <div
                className="h-[3px] shrink-0"
                style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #f59e0b 100%)' }}
              />

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold text-violet-300/90">Monthly</p>
                  <span className="subscribe-badge-pulse text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Best value
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>
                    {monthlyPrice}
                  </span>
                </div>
                <p className="text-sm text-violet-300/45 mb-6">per month</p>
                <p className="text-xs text-white/45 mb-6 leading-relaxed flex-1">
                  Everything in Weekly — plus AI scene images, character portraits, and immersive soundscapes.
                </p>
                <button
                  onClick={() => handleSubscribe('month')}
                  disabled={loading !== null}
                  className="subscribe-cta flex w-full items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-gray-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  <span className="shimmer-strip" />
                  {loading === 'month' ? (
                    'Redirecting…'
                  ) : (
                    <>
                      {pendingFriendRewardWeeks > 0
                        ? `Subscribe · ${pendingFriendRewardWeeks}wk free`
                        : 'Start monthly'}
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Fallback: single non-standard interval */}
          {!weeklyIC && !monthlyIC && enabledIntervals.length > 0 && (
            <div
              data-plan-card=""
              data-monthly-card=""
              className="rounded-xl flex flex-col overflow-hidden"
              style={{
                background: 'rgba(124,58,237,0.13)',
                animation: 'plan-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.17s both, monthly-glow-pulse 4s ease-in-out 0.68s infinite',
              }}
            >
              <div className="h-[3px] shrink-0" style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #f59e0b 100%)' }} />
              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm font-semibold text-violet-300/90 mb-5">
                  {enabledIntervals[0].interval.charAt(0).toUpperCase() + enabledIntervals[0].interval.slice(1)}
                </p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>
                    {formatCents(enabledIntervals[0].priceCents)}
                  </span>
                </div>
                <p className="text-sm text-violet-300/45 mb-6">per {enabledIntervals[0].interval}</p>
                <div className="flex-1" />
                <button
                  onClick={() => handleSubscribe(enabledIntervals[0].interval)}
                  disabled={loading !== null}
                  className="subscribe-cta flex w-full items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-gray-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  <span className="shimmer-strip" />
                  {loading ? 'Redirecting…' : <><span>Subscribe</span><ArrowRight size={13} /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center mb-5">{error}</p>
        )}

        {/* ── Feature comparison table ── */}

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-[11px] font-semibold text-white/28 tracking-wider">Compare plans</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <div
          className="rounded-xl overflow-hidden mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Column headers */}
          <div
            className="grid text-xs font-semibold"
            style={{ gridTemplateColumns: '1fr 76px 76px 88px' }}
          >
            <div className="px-5 py-3 text-white/30">Features</div>
            <div className="py-3 text-white/25 text-center">Free</div>
            <div className="py-3 text-amber-400/55 text-center">Weekly</div>
            <div className="py-3 text-violet-300/65 text-center">Monthly</div>
          </div>

          {FEATURES.map((f, i) => {
            const monthlyExclusive = !f.weekly && f.monthly
            return (
              <div
                key={f.label}
                className="grid border-t"
                style={{
                  gridTemplateColumns: '1fr 76px 76px 88px',
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: i >= PREMIUM_START ? 'rgba(124,58,237,0.04)' : undefined,
                }}
              >
                <div className="px-5 py-3.5 flex items-center gap-2.5">
                  <f.icon size={13} className="text-white/25 shrink-0" />
                  <span className="text-sm text-white/65">{f.label}</span>
                </div>
                <div className="py-3.5 flex items-center justify-center">
                  {f.free
                    ? <Check size={15} className="text-amber-400" strokeWidth={2.5} />
                    : <span className="text-white/20 text-base leading-none select-none">—</span>
                  }
                </div>
                <div className="py-3.5 flex items-center justify-center">
                  {f.weekly
                    ? <Check size={15} className="text-amber-400" strokeWidth={2.5} />
                    : <span className="text-white/20 text-base leading-none select-none">—</span>
                  }
                </div>
                <div
                  className="py-3.5 flex items-center justify-center"
                  style={monthlyExclusive ? { background: 'rgba(124,58,237,0.1)' } : undefined}
                >
                  {f.monthly
                    ? <Check size={15} className="text-amber-400" strokeWidth={2.5} />
                    : <span className="text-white/20 text-base leading-none select-none">—</span>
                  }
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust footer */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <Lock size={10} />
            Secure checkout via Stripe · Cancel anytime from your profile
          </div>
          <p className="text-xs text-white/18">
            Reading all stories is free — no account needed.
          </p>
        </div>

      </div>
    </div>
  )
}
