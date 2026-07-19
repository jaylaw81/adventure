import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { getPricingConfig, formatCents } from '@/lib/pricing'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles, Music, BookOpen, Globe, Tag, Star, Lock, Sword, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, affordable plans for interactive story creators. Start free, upgrade when you\'re ready.',
}

const FEATURES: {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  weekly: boolean
  monthly: boolean
}[] = [
  { label: 'Visual story canvas',              icon: BookOpen, weekly: true,  monthly: true  },
  { label: 'Unlimited scenes & branches',       icon: Sparkles, weekly: true,  monthly: true  },
  { label: 'World Builder RPG system',          icon: Sword,    weekly: true,  monthly: true  },
  { label: 'Characters, items & foe combat',    icon: Users,    weekly: true,  monthly: true  },
  { label: 'Publish stories publicly',          icon: Globe,    weekly: true,  monthly: true  },
  { label: 'Tags & audience controls',          icon: Tag,      weekly: true,  monthly: true  },
  { label: 'Story ratings & reviews',           icon: Star,     weekly: true,  monthly: true  },
  { label: 'Scene image generation',            icon: Sparkles, weekly: false, monthly: true  },
  { label: 'Character portraits',               icon: Sparkles, weekly: false, monthly: true  },
  { label: 'Scene soundscapes',                 icon: Music,    weekly: false, monthly: true  },
]

// Index after which the "monthly-only" features start
const PREMIUM_START = 7

export default async function PricingPage() {
  const [session, pricing] = await Promise.all([
    getServerSession(authOptions),
    getPricingConfig(),
  ])

  let subStatus: string | null = null
  if (session?.user?.email) {
    const [user] = await db
      .select({ subscriptionStatus: users.subscriptionStatus })
      .from(users)
      .where(eq(users.email, session.user.email))
    subStatus = user?.subscriptionStatus ?? null
  }

  const isActive = subStatus === 'active' || subStatus === 'trialing'

  const weeklyIC  = pricing.intervals.find(i => i.interval === 'week'  && i.enabled)
  const monthlyIC = pricing.intervals.find(i => i.interval === 'month' && i.enabled)

  const weeklyPrice  = weeklyIC  ? formatCents(weeklyIC.priceCents)  : '$2'
  const monthlyPrice = monthlyIC ? formatCents(monthlyIC.priceCents) : '$8'

  function ctaHref(interval: 'week' | 'month') {
    if (isActive) return '/profile'
    return `/subscribe?interval=${interval}`
  }

  const ctaLabel = isActive ? 'Manage plan' : undefined

  return (
    <div
      className="min-h-screen relative overflow-hidden -mt-16"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-32 pb-20">

        {/* Page header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
            style={{ letterSpacing: '-0.03em', textWrap: 'balance' } as React.CSSProperties}
          >
            Simple, honest pricing
          </h1>
          <p className="text-violet-300/70 text-base sm:text-lg leading-relaxed">
            Pick your pace. Reading stories is always free.
          </p>
          {pricing.trialDays > 0 && (
            <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-medium">
              <Sparkles size={13} />
              Start with a {pricing.trialDays}-day free trial
            </div>
          )}
        </div>

        {/* ── Plan cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Weekly */}
          <div
            className="rounded-xl p-6 flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p className="text-sm font-semibold text-white/60 mb-5">Weekly</p>
            <div className="mb-1">
              <span
                className="text-4xl font-extrabold text-white"
                style={{ letterSpacing: '-0.03em' }}
              >
                {weeklyPrice}
              </span>
            </div>
            <p className="text-sm text-white/35 mb-6">per week</p>
            <p className="text-xs text-white/40 mb-6 leading-relaxed flex-1">
              Story editor, unlimited scenes, publish publicly
            </p>
            <Link
              href={ctaHref('week')}
              className="block w-full py-3 rounded-lg text-sm font-bold text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors text-center"
            >
              {ctaLabel ?? 'Start Weekly'}
            </Link>
          </div>

          {/* Monthly */}
          <div
            className="rounded-xl p-6 flex flex-col"
            style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.45)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-white/80">Monthly</p>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                Best value
              </span>
            </div>
            <div className="mb-1">
              <span
                className="text-4xl font-extrabold text-white"
                style={{ letterSpacing: '-0.03em' }}
              >
                {monthlyPrice}
              </span>
            </div>
            <p className="text-sm text-white/35 mb-6">per month</p>
            <p className="text-xs text-white/40 mb-6 leading-relaxed flex-1">
              Everything in Weekly, plus scene images, character portraits, and scene soundscapes
            </p>
            <Link
              href={ctaHref('month')}
              className="flex w-full items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              {ctaLabel ?? 'Start Monthly'}
              {!isActive && <ArrowRight size={14} />}
            </Link>
          </div>
        </div>

        {/* ── Feature comparison table ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Column header row */}
          <div
            className="grid text-xs font-semibold"
            style={{ gridTemplateColumns: '1fr 88px 88px' }}
          >
            <div className="px-5 py-3 text-white/30">Features</div>
            <div className="py-3 text-white/35 text-center">Weekly</div>
            <div className="py-3 text-white/50 text-center">Monthly</div>
          </div>

          {/* Feature rows */}
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="grid border-t"
              style={{
                gridTemplateColumns: '1fr 88px 88px',
                borderColor: 'rgba(255,255,255,0.06)',
                background: i >= PREMIUM_START ? 'rgba(124,58,237,0.04)' : undefined,
              }}
            >
              <div className="px-5 py-3.5 flex items-center gap-2.5">
                <f.icon size={13} className="text-white/25 shrink-0" />
                <span className="text-sm text-white/65">{f.label}</span>
              </div>
              <div className="py-3.5 flex items-center justify-center">
                {f.weekly
                  ? <Check size={15} className="text-amber-400" strokeWidth={2.5} />
                  : <span className="text-white/20 text-base leading-none select-none">—</span>
                }
              </div>
              <div className="py-3.5 flex items-center justify-center">
                {f.monthly
                  ? <Check size={15} className="text-amber-400" strokeWidth={2.5} />
                  : <span className="text-white/20 text-base leading-none select-none">—</span>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-white/22">
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
