'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, BookOpen, GitBranch,
  Sparkles, ArrowRight, Check, Play, ChevronRight, Globe, BookMarked, Sword, Clock
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { analytics } from '@/lib/analytics'
import AdventureCard from '@/components/shared/AdventureCard'
import PageBanner from '@/components/shared/PageBanner'
import type { AdventureWithCounts } from '@/lib/queries'
import type { PricingConfig } from '@/lib/pricing'

type LatestPost = {
  slug: string
  title: string
  description: string
  category: string
  readingMinutes: number
  publishedAt: string
  heroImageUrl: string | null
}

function usePricingText(): { amount: string; interval: string } {
  const [val, setVal] = useState({ amount: '$2', interval: 'week' })
  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then((c: PricingConfig) => {
        const ic = c.intervals.find(i => i.interval === c.defaultInterval && i.enabled)
          ?? c.intervals.find(i => i.enabled)
        if (!ic) return
        const d = ic.priceCents / 100
        setVal({
          amount: Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`,
          interval: ic.interval,
        })
      })
      .catch(() => {})
  }, [])
  return val
}

/* ── UI Mockups ─────────────────────────────────────────────────── */

function HeroStoryViz() {
  return (
    <div className="relative w-full" aria-hidden="true">
      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{
        inset: '-15%',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.3) 0%, transparent 65%)',
        filter: 'blur(48px)',
      }} />

      {/* Main reader card */}
      <div className="relative rounded-xl overflow-hidden" style={{
        background: 'linear-gradient(160deg, #14112e 0%, #0d0c1f 100%)',
        border: '1px solid rgba(167,139,250,0.15)',
        boxShadow: '0 28px 72px rgba(0,0,0,0.6)',
      }}>
        {/* Scene image area */}
        <div className="relative h-44 overflow-hidden" style={{
          background: 'linear-gradient(150deg, #200d50 0%, #0c1535 100%)',
        }}>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 35% 65%, rgba(124,58,237,0.5) 0%, transparent 58%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 80% 25%, rgba(245,158,11,0.15) 0%, transparent 50%)',
          }} />
          {/* Subtle star field */}
          <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice">
            {[
              [20,18],[55,8],[78,22],[88,14],[40,30],[65,40],[12,35],[95,38],
            ].map(([x,y], i) => (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r="1" fill="white"
                style={{ animation: `twinkle ${3 + (i * 0.4)}s ease-in-out infinite ${i * 0.3}s` }} />
            ))}
          </svg>
          {/* Fade bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{
            background: 'linear-gradient(to top, #0d0c1f, transparent)',
          }} />
          {/* Chapter badge */}
          <div className="absolute top-3.5 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
            background: 'rgba(124,58,237,0.28)',
            border: '1px solid rgba(167,139,250,0.3)',
          }}>
            <BookMarked size={9} className="text-violet-300" />
            <span className="text-[10px] font-semibold text-violet-300">Chapter 2 · The Oracle&apos;s Chamber</span>
          </div>
        </div>

        {/* Story text */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-sm leading-relaxed text-white/75">
            The oracle&apos;s eyes turn silver as she faces you. &ldquo;Three truths I know about your path — but you may only hear one.&rdquo;
          </p>
        </div>

        {/* Choices */}
        <div className="px-5 pb-5 pt-2.5 flex flex-col gap-2">
          <button tabIndex={-1} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between" style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(167,139,250,0.38)',
            color: '#c4b5fd',
          }}>
            <span>&ldquo;Tell me about the darkness ahead.&rdquo;</span>
            <ArrowRight size={11} className="opacity-60 shrink-0 ml-2" />
          </button>
          <button tabIndex={-1} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between" style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            color: '#fbbf24',
          }}>
            <span>&ldquo;Reveal who I was before the curse.&rdquo;</span>
            <ArrowRight size={11} className="opacity-60 shrink-0 ml-2" />
          </button>
          <button tabIndex={-1} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between" style={{
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.32)',
          }}>
            <span>&ldquo;I don&apos;t trust her — walk away.&rdquo;</span>
            <ArrowRight size={11} className="opacity-40 shrink-0 ml-2" />
          </button>
        </div>
      </div>

      {/* Floating: character stats */}
      <div className="absolute -right-4 top-7 rounded-xl p-3 hidden lg:block" style={{
        background: '#13112c',
        border: '1px solid rgba(167,139,250,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transform: 'rotate(3.5deg)',
      }}>
        <p className="text-[9px] font-bold text-violet-400/50 uppercase tracking-wider mb-2.5">Arwen</p>
        <div className="flex flex-col gap-1.5 w-28">
          {([
            ['HP',    '65%', '#22c55e'],
            ['Mana',  '40%', '#a78bfa'],
            ['Gold',  '80%', '#f59e0b'],
          ] as const).map(([label, pct, color]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[9px] w-8" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: pct, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating: endings count */}
      <div className="absolute -left-4 bottom-12 rounded-xl px-3 py-2 hidden lg:flex items-center gap-2" style={{
        background: '#0d0c1e',
        border: '1px solid rgba(245,158,11,0.24)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transform: 'rotate(-2.5deg)',
      }}>
        <GitBranch size={13} className="text-amber-400 shrink-0" />
        <div>
          <p className="text-[11px] font-bold text-amber-400">12 endings</p>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>across 4 chapters</p>
        </div>
      </div>
    </div>
  )
}

function ReaderMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-72 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-violet-200"
      style={{ background: '#faf5ff' }}>
      {/* Phone notch */}
      <div className="h-7 flex items-center justify-center" style={{ background: '#2d0b69' }}>
        <div className="w-20 h-3.5 rounded-full" style={{ background: '#1a1040' }} />
      </div>
      {/* Story content */}
      <div className="px-5 py-5" style={{ background: '#faf5ff' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs text-violet-400 font-medium">Chapter 2</div>
          <ChevronRight size={12} className="text-violet-300" />
          <div className="text-xs text-violet-400">The Crossroads</div>
        </div>
        {/* Scene image placeholder */}
        <div className="w-full h-28 rounded-xl mb-4 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #2d0b69, #1a1040)' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-16 h-16 rounded-full border-2 border-violet-400 flex items-center justify-center">
              <Sparkles size={24} className="text-violet-400" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded">Scene image</div>
        </div>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#1e0a3c' }}>
          The old wizard gestures toward two glowing portals. &ldquo;Choose wisely — each path leads to a different fate.&rdquo;
        </p>
        <div className="flex flex-col gap-2.5">
          <button tabIndex={-1} className="w-full text-left px-4 py-2.5 rounded-xl border-2 border-violet-400 text-sm font-medium flex items-center justify-between"
            style={{ background: '#f5f3ff', color: '#5b21b6' }}>
            Step through the golden portal
            <ArrowRight size={14} className="text-violet-500" />
          </button>
          <button tabIndex={-1} className="w-full text-left px-4 py-2.5 rounded-xl border border-violet-100 bg-white text-sm font-medium text-violet-700 flex items-center justify-between">
            Take the silver portal
            <ArrowRight size={14} className="text-violet-300" />
          </button>
          <button tabIndex={-1} className="w-full text-left px-4 py-2.5 rounded-xl border border-violet-100 bg-white text-sm font-medium text-violet-700 flex items-center justify-between">
            Refuse both and walk away
            <ArrowRight size={14} className="text-violet-300" />
          </button>
        </div>
      </div>
      {/* Phone home bar */}
      <div className="py-2 flex justify-center border-t border-violet-100" style={{ background: '#faf5ff' }}>
        <div className="w-24 h-1 rounded-full bg-violet-200" />
      </div>
    </div>
  )
}

/* ── Landing Page ────────────────────────────────────────────────── */

function LandingPage() {
  const { amount: minPrice, interval: minInterval } = usePricingText()
  const [latestPost, setLatestPost] = useState<LatestPost | null>(null)

  useEffect(() => {
    fetch('/api/blog?limit=1')
      .then(r => r.json())
      .then((posts: LatestPost[]) => { if (posts[0]) setLatestPost(posts[0]) })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      {/* -mt-16 pulls the hero behind the transparent sticky header (h-16 = 64px) */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 sm:pt-44 sm:pb-28 -mt-16"
        style={{ background: 'linear-gradient(155deg, #160b30 0%, #0e1428 52%, #090d1c 100%)' }}>

        {/* Atmospheric depth layers */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 20% 55%, rgba(124,58,237,0.22) 0%, transparent 55%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.08) 0%, transparent 48%)',
        }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left" style={{
              animation: 'hero-rise 0.75s cubic-bezier(0.22,1,0.36,1) 0.05s both',
            }}>
              <h1
                className="font-extrabold text-white mb-5 leading-[1.08]"
                style={{
                  fontSize: 'clamp(2.25rem, 3.5vw + 1.25rem, 4.75rem)',
                  letterSpacing: '-0.025em',
                  textWrap: 'balance',
                }}
              >
                Create Stories Where Every Choice Matters
              </h1>
              <p className="text-lg sm:text-xl mb-4 max-w-lg" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: '1.6' }}>
                Design branching adventures on a visual canvas — from classic choose-your-own stories to full RPG worlds with characters and combat.
              </p>
              <p className="text-sm mb-8 max-w-lg" style={{ color: 'rgba(167,139,250,0.6)' }}>
                Free to start — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/sign-up"
                  onClick={() => analytics.landingSignInClicked('hero')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white transition-all"
                  style={{
                    background: '#7c3aed',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)'
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = ''
                  }}
                >
                  Start creating
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/demo"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = ''
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'
                  }}
                >
                  <Play size={15} />
                  Try the editor
                </Link>
              </div>
            </div>

            {/* Right: reader story experience */}
            <div className="flex-1 w-full max-w-lg" style={{
              animation: 'hero-rise 0.85s cubic-bezier(0.22,1,0.36,1) 0.18s both',
            }}>
              <HeroStoryViz />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 py-24" style={{ background: '#f5f3ff' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-16 text-center"
            style={{ color: '#1e0a3c', letterSpacing: '-0.02em', textWrap: 'balance' }}
          >
            From idea to adventure in minutes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-violet-200">
            {[
              {
                step: '1',
                icon: GitBranch,
                iconColor: '#7c3aed',
                title: 'Build your canvas',
                desc: 'Drag scenes onto an infinite canvas and connect them. Map every branch of your story visually.',
              },
              {
                step: '2',
                icon: Sparkles,
                iconColor: '#d97706',
                title: 'Write & illustrate',
                desc: 'Write scene content and generate cinematic images for each moment — no design skills needed.',
              },
              {
                step: '3',
                icon: Globe,
                iconColor: '#6d28d9',
                title: 'Publish & share',
                desc: 'Hit publish and share your link. Readers play through every branch and discover every ending.',
              },
            ].map(({ step, icon: Icon, iconColor, title, desc }) => (
              <div key={step} className="relative flex flex-col gap-4 px-8 py-10 md:px-10">
                <span
                  className="absolute top-6 right-7 text-7xl font-black leading-none select-none pointer-events-none"
                  style={{ color: 'rgba(124,58,237,0.07)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {step}
                </span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <Icon size={19} style={{ color: iconColor }} />
                </div>
                <div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#4b3d6b' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reader Experience ── */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Phone mockup */}
            <div className="flex-1 flex justify-center">
              <ReaderMockup />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-5"
                style={{ color: '#1e0a3c', letterSpacing: '-0.02em', textWrap: 'balance' }}
              >
                A beautiful reading experience for your audience
              </h2>
              <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: '#4b5563' }}>
                Readers get an immersive, mobile-friendly experience. Every scene loads instantly, choices feel natural, and scene images bring the story to life.
              </p>
              <ul className="flex flex-col gap-3 text-sm">
                {[
                  'Clean, distraction-free reading layout',
                  'Tap choices to navigate branches',
                  'Scene illustrations for every moment',
                  'Live character stats sidebar in World Builder stories',
                  'Turn-based foe combat with items and abilities',
                  'Rate and review stories at the end',
                  'Works on any device — phone, tablet, desktop',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3" style={{ color: '#374151' }}>
                    <Check size={14} className="text-violet-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-12"
            style={{ color: '#1e0a3c', letterSpacing: '-0.02em', textWrap: 'balance' }}
          >
            Built for the story, not the software
          </h2>
          <div className="flex flex-col divide-y divide-violet-100">
            {[
              { num: '01', title: 'Visual Canvas', desc: 'Map your full story structure with drag-and-drop scene nodes on an infinite canvas. See every branch at a glance.' },
              { num: '02', title: 'World Builder', desc: 'Create RPG-style adventures with a custom cast of heroes and foes. Characters have attributes like HP, Gold, and Strength that shift with every choice — and foe encounters add real stakes with turn-based combat.' },
              { num: '03', title: 'Chapters', desc: 'Break long stories into chapters — each with its own scenes, branches, and a smooth "Next Chapter" transition.' },
              { num: '04', title: 'Scene Images', desc: 'Generate cinematic illustrations for every scene. No art skills required — just write the content and let the platform paint the moment.' },
              { num: '05', title: 'One-click Publish', desc: 'Share your story with a public link. Built-in validation catches dead ends before your readers do.' },
              { num: '06', title: 'Audience Controls', desc: 'Set age ratings and genre tags. Reach the right readers with the right story.' },
              { num: '07', title: 'Ratings & Reviews', desc: 'Readers rate and review. Build credibility through community feedback across every ending they discover.' },
              { num: '08', title: 'Simple Pricing', desc: `Creating and editing stories requires a subscription — starting at just ${minPrice}/${minInterval}. Reading and browsing are always free.` },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-5 sm:gap-10 py-5 group">
                <span className="text-xs font-mono text-violet-400 pt-1.5 w-6 shrink-0">{num}</span>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-10">
                  <h3 className="text-base font-bold sm:w-40 sm:shrink-0 group-hover:text-violet-600 transition-colors"
                    style={{ color: '#1e0a3c' }}>{title}</h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: '#6b7280' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest from the blog ── */}
      {latestPost && (
        <section className="px-6 py-20 bg-white border-t border-violet-100">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#1e0a3c' }}>
                  From the blog
                </h2>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Writing tips, story ideas, and craft for interactive fiction writers
                </p>
              </div>
              <Link
                href="/blog"
                className="shrink-0 mt-1 flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                All articles <ArrowRight size={13} />
              </Link>
            </div>

            {/* Featured card */}
            <Link
              href={`/blog/${latestPost.slug}`}
              className="group flex flex-col lg:flex-row overflow-hidden rounded-xl border border-violet-200 hover:border-violet-400 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: '#faf5ff' }}
            >
              {/* Image */}
              {latestPost.heroImageUrl ? (
                <div className="relative lg:w-[44%] shrink-0 h-56 sm:h-72 lg:h-auto overflow-hidden">
                  <Image
                    src={latestPost.heroImageUrl}
                    alt={latestPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    unoptimized
                  />
                  {/* Fade right edge into card background on desktop */}
                  <div
                    className="hidden lg:block absolute inset-y-0 right-0 w-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to right, transparent, #faf5ff)' }}
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div className="hidden lg:flex lg:w-[44%] shrink-0 items-center justify-center" style={{ background: '#ede9fe' }}>
                  <BookOpen size={48} style={{ color: '#7c3aed', opacity: 0.25 }} aria-hidden="true" />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col justify-center px-8 py-8 lg:px-10 lg:py-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-200 text-violet-800">
                    {latestPost.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6b7280' }}>
                    <Clock size={11} />
                    {latestPost.readingMinutes} min read
                  </span>
                </div>
                <h3
                  className="text-2xl lg:text-3xl font-extrabold leading-snug mb-3 group-hover:text-violet-700 transition-colors duration-200"
                  style={{ color: '#1e0a3c' }}
                >
                  {latestPost.title}
                </h3>
                <p className="text-base leading-relaxed line-clamp-3 mb-7" style={{ color: '#4b5563' }}>
                  {latestPost.description}
                </p>
                <span
                  className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 group-hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  Read article
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: 'linear-gradient(155deg, #160b30 0%, #0d1427 52%, #090d1c 100%)' }}>
        {/* Atmospheric glows */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 40% 50%, rgba(124,58,237,0.28) 0%, transparent 60%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 72% 30%, rgba(245,158,11,0.07) 0%, transparent 45%)',
        }} />
        <div className="relative max-w-2xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-extrabold text-white mb-5"
            style={{ letterSpacing: '-0.025em', textWrap: 'balance' }}
          >
            Ready to tell your story?
          </h2>
          <p className="text-lg mb-3 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Join creators building branching adventures their readers love.
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(167,139,250,0.6)' }}>
            From {minPrice}/{minInterval}. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              onClick={() => analytics.landingSignInClicked('cta_bottom')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all"
              style={{ background: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = ''
              }}
            >
              Start creating
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.9)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = ''
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'
              }}
            >
              <BookOpen size={16} />
              Browse stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Dashboard ───────────────────────────────────────────────────── */

function Dashboard() {
  const { data: session } = useSession()
  const [adventures, setAdventures] = useState<AdventureWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [canMakePublic, setCanMakePublic] = useState(true)
  const [canMakePrivate, setCanMakePrivate] = useState(true)
  const [imagesGenerating, setImagesGenerating] = useState(false)
  const [imagesGenerated, setImagesGenerated] = useState(0)
  const [showPrivateNudge, setShowPrivateNudge] = useState(false)

  const dismissPrivateNudge = () => {
    const n = adventures.filter(a => !a.isPublic).length
    try {
      localStorage.setItem('private_nudge_v1', JSON.stringify({ dismissedAt: Date.now(), dismissedCount: n }))
    } catch {}
    setShowPrivateNudge(false)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/adventures').then(r => r.json()),
      fetch('/api/org/me').then(r => r.json()),
    ]).then(([data, orgData]) => {
      setAdventures(data)
      const canPublish = !(orgData?.orgPrivacyLevel && orgData.orgPrivacyLevel !== 'public')
      if (!canPublish) setCanMakePublic(false)
      // Private stories require an active subscription (not just a trial)
      const subStatus = session?.user?.subscriptionStatus
      const isActiveSubscriber =
        subStatus === 'active' ||
        session?.user?.tier === 'organization' ||
        !!session?.user?.isAdmin
      setCanMakePrivate(isActiveSubscriber)
      setLoading(false)

      if (canPublish && Array.isArray(data)) {
        const privateCount = (data as AdventureWithCounts[]).filter(a => !a.isPublic).length
        if (privateCount > 0) {
          let shouldShow = true
          try {
            const raw = localStorage.getItem('private_nudge_v1')
            if (raw) {
              const { dismissedAt, dismissedCount } = JSON.parse(raw)
              const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
              if (daysSince < 7 && privateCount <= dismissedCount) shouldShow = false
            }
          } catch {}
          if (shouldShow) setShowPrivateNudge(true)
        }
      }
    })

    setImagesGenerating(true)
    fetch('/api/generate-images', { method: 'POST' })
      .then(r => r.json())
      .then(data => { if (data?.processed > 0) setImagesGenerated(data.processed) })
      .catch(() => {})
      .finally(() => setImagesGenerating(false))
  }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/adventures/${id}`, { method: 'DELETE' })
    setAdventures(prev => prev.filter(a => a.id !== id))
  }

  const firstName = session?.user?.name?.split(' ')[0]

  const isFreeTier = !!session?.user &&
    !session.user.isAdmin &&
    session.user.tier !== 'organization' &&
    !['active', 'trialing'].includes(session.user.subscriptionStatus ?? '')

  const canViewAnalytics = !!session?.user && (
    session.user.subscriptionInterval === 'month' ||
    !!session.user.isAdmin
  )
  const canUseCustomSlug = canViewAnalytics

  const atFreeLimit = !loading && isFreeTier && adventures.length >= 1

  return (
    <>
      <PageBanner
        title={firstName ? `${firstName}'s Stories` : 'Your Stories'}
        subtitle="Create and play branching adventures"
        action={
          atFreeLimit ? (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <Sparkles size={18} />
              Upgrade to Create More
            </Link>
          ) : (
            <Link
              href="/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
            >
              <Plus size={18} />
              New Story
            </Link>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showPrivateNudge && (() => {
          const n = adventures.filter(a => !a.isPublic).length
          return n > 0 ? (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Globe size={14} className="text-amber-500 shrink-0" />
              <span>
                {canMakePrivate
                  ? <>You have {n} private {n === 1 ? 'story' : 'stories'} — toggle &ldquo;Make public&rdquo; on any card to share {n === 1 ? 'it' : 'them'} with the world.</>
                  : <>You have {n} unpublished {n === 1 ? 'story' : 'stories'}. Toggle &ldquo;Make public&rdquo; to share, or <Link href="/pricing" className="underline font-medium hover:text-amber-900">subscribe</Link> to keep {n === 1 ? 'it' : 'them'} private.</>
                }
              </span>
              <button onClick={dismissPrivateNudge} className="ml-auto text-amber-600 hover:text-amber-800 text-xs shrink-0">✕</button>
            </div>
          ) : null
        })()}
        {imagesGenerated > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm text-violet-800">
            <Sparkles size={14} className="text-violet-500 shrink-0" />
            Images generated for {imagesGenerated} scene{imagesGenerated !== 1 ? 's' : ''}. Open a story to see them.
            <button onClick={() => setImagesGenerated(0)} className="ml-auto text-violet-600 hover:text-violet-800 text-xs">✕</button>
          </div>
        )}
        {imagesGenerating && !imagesGenerated && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-2.5 text-xs text-violet-600">
            <Sparkles size={13} className="text-violet-300 shrink-0 animate-pulse" />
            Checking for scenes to illustrate…
          </div>
        )}
        {isFreeTier && !loading && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <p className="flex-1 text-sm text-violet-800">
              <span className="font-semibold">Free plan</span> — 1 public story using Block Builder only.{' '}
              <Link href="/pricing" className="font-medium underline hover:text-violet-900">Upgrade</Link>{' '}
              for unlimited stories, Node Graph &amp; World Builder, and scene images.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-violet-600">Loading…</div>
        ) : adventures.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border-2 border-dashed border-violet-200"
            style={{ background: '#f5f3ff' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#ede9fe' }}>
              <BookOpen size={28} style={{ color: '#7c3aed' }} />
            </div>
            <p className="text-lg font-semibold mb-1" style={{ color: '#1e0a3c' }}>No stories yet</p>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Create your first branching adventure!</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-sm transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              <Plus size={18} />
              Create Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {adventures.map(adventure => (
              <AdventureCard key={adventure.id} adventure={adventure} onDelete={handleDelete} canMakePublic={canMakePublic} canMakePrivate={canMakePrivate} canViewAnalytics={canViewAnalytics} canUseCustomSlug={canUseCustomSlug} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Root ────────────────────────────────────────────────────────── */

export default function HomePage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="text-center py-20 text-violet-600">Loading…</div>
  }

  return status === 'authenticated' ? <Dashboard /> : <LandingPage />
}
