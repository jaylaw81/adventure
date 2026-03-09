'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, BookOpen, GitBranch, Share2, Sparkles, Star,
  ArrowRight, Check, Play, ChevronRight, Zap, Users, Globe
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { analytics } from '@/lib/analytics'
import AdventureCard from '@/components/shared/AdventureCard'
import type { AdventureWithCounts } from '@/lib/queries'

/* ── UI Mockups ─────────────────────────────────────────────────── */

function CanvasMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      style={{ background: '#0f0e17' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10" style={{ background: '#1a1730' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-4 bg-white/5 rounded-md h-5 flex items-center px-3">
          <span className="text-xs text-white/30 font-mono">storyquestor.com/edit/…</span>
        </div>
      </div>
      {/* Editor toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5" style={{ background: '#16142a' }}>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-amber-400 border border-amber-400/30 bg-amber-400/10">
          <Plus size={11} /> Add Scene
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white/40 border border-white/10">
          <Sparkles size={11} /> AI Image
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-gray-900 bg-amber-500">
          Publish
        </div>
      </div>
      {/* Canvas area */}
      <div className="relative h-64 overflow-hidden px-4 py-4" style={{ background: 'radial-gradient(ellipse at 30% 50%, #1e1b3a 0%, #0f0e17 70%)' }}>
        {/* Grid dots */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Connector lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Start → Scene A */}
          <path d="M 155 72 C 210 72 220 60 265 60" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="0" opacity="0.6" markerEnd="url(#arrowAmber)" />
          {/* Start → Scene B */}
          <path d="M 155 88 C 210 88 220 118 265 118" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowPurple)" />
          {/* Scene A → Ending */}
          <path d="M 370 60 C 420 60 430 72 460 72" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowAmber)" />
          {/* Scene B → Ending */}
          <path d="M 370 118 C 420 118 440 90 460 86" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowPurple)" />
          <defs>
            <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#f59e0b" opacity="0.8" />
            </marker>
            <marker id="arrowPurple" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#a78bfa" opacity="0.8" />
            </marker>
          </defs>
        </svg>

        {/* Start node */}
        <div className="absolute top-10 left-8 w-36 rounded-xl border border-green-500/40 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-green-500/30 bg-green-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-semibold text-green-400">Start</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">The forest path splits before you…</p>
          </div>
        </div>

        {/* Scene A */}
        <div className="absolute top-3 left-[265px] w-36 rounded-xl border border-amber-500/30 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Scene</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">You take the left path into the caves…</p>
          </div>
        </div>

        {/* Scene B */}
        <div className="absolute top-[84px] left-[265px] w-36 rounded-xl border border-purple-500/30 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-purple-500/20 bg-purple-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-purple-400">Scene</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">The river flows east toward the village…</p>
          </div>
        </div>

        {/* Ending node */}
        <div className="absolute top-[44px] left-[460px] w-36 rounded-xl border border-red-500/40 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-red-500/30 bg-red-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs font-semibold text-red-400">Ending</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">The hero emerges victorious!</p>
          </div>
        </div>

        {/* Side panel hint */}
        <div className="absolute inset-y-0 right-0 w-48 border-l border-white/5 hidden sm:block" style={{ background: '#16142a' }}>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Edit Scene</p>
            <div className="space-y-2">
              <div className="h-2 bg-white/10 rounded-full w-full" />
              <div className="h-2 bg-white/10 rounded-full w-4/5" />
              <div className="h-2 bg-white/10 rounded-full w-3/5" />
            </div>
            <div className="mt-4 h-16 rounded-lg bg-white/5 border border-white/10" />
            <div className="mt-3 flex gap-2">
              <div className="flex-1 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30" />
              <div className="flex-1 h-7 rounded-lg bg-white/5 border border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReaderMockup() {
  return (
    <div className="relative mx-auto w-72 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800"
      style={{ background: '#f9fafb' }}>
      {/* Phone notch */}
      <div className="bg-gray-900 h-7 flex items-center justify-center">
        <div className="w-20 h-3.5 bg-gray-800 rounded-full" />
      </div>
      {/* Story content */}
      <div className="px-5 py-5" style={{ background: '#f9fafb' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs text-gray-400">Chapter 2</div>
          <ChevronRight size={12} className="text-gray-300" />
          <div className="text-xs text-gray-400">The Crossroads</div>
        </div>
        {/* Scene image placeholder */}
        <div className="w-full h-28 rounded-xl mb-4 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a1025, #0f172a)' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <Sparkles size={24} className="text-amber-400" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded">AI scene</div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-5">
          The old wizard gestures toward two glowing portals. &ldquo;Choose wisely — each path leads to a different fate.&rdquo;
        </p>
        <div className="flex flex-col gap-2.5">
          <button className="w-full text-left px-4 py-2.5 rounded-xl border-2 border-amber-400 bg-amber-50 text-sm font-medium text-amber-800 flex items-center justify-between">
            Step through the golden portal
            <ArrowRight size={14} className="text-amber-500" />
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 flex items-center justify-between">
            Take the silver portal
            <ArrowRight size={14} className="text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 flex items-center justify-between">
            Refuse both and walk away
            <ArrowRight size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
      {/* Phone home bar */}
      <div className="bg-gray-50 py-2 flex justify-center border-t border-gray-100">
        <div className="w-24 h-1 rounded-full bg-gray-300" />
      </div>
    </div>
  )
}

/* ── Landing Page ────────────────────────────────────────────────── */

function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28"
        style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-400/20">
                <BookOpen size={14} />
                Interactive Storytelling Platform
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight">
                Create Stories Where<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                  Every Choice Matters
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl">
                Build branching adventures with a visual drag-and-drop canvas. Add AI-generated scene images. Share with readers who decide the outcome.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/sign-up"
                  onClick={() => analytics.landingSignInClicked('hero')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:shadow-amber-500/25 hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  Start Creating — it&apos;s free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/demo"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-300 border border-white/15 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Play size={15} />
                  Try the editor
                </Link>
              </div>
              {/* Trust badges */}
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                {['Free to start', 'No credit card', 'Publish instantly'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check size={13} className="text-green-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: canvas mockup */}
            <div className="flex-1 w-full max-w-2xl">
              <CanvasMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 border-y border-gray-100 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">From idea to adventure in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connecting line on desktop */}
            <div className="hidden md:block absolute top-9 left-1/3 right-1/3 h-px bg-gradient-to-r from-amber-300 to-amber-300 via-amber-400" />

            {[
              {
                step: '01',
                icon: GitBranch,
                color: 'amber',
                title: 'Build your canvas',
                desc: 'Drag scenes onto the canvas and draw connections between them. Map out every branch of your story visually.'
              },
              {
                step: '02',
                icon: Sparkles,
                color: 'purple',
                title: 'Write & illustrate',
                desc: 'Write your scene content and generate cinematic AI images for each moment — no design skills needed.'
              },
              {
                step: '03',
                icon: Globe,
                color: 'green',
                title: 'Publish & share',
                desc: 'Hit publish and share your link. Readers play through your branching story and discover every ending.'
              },
            ].map(({ step, icon: Icon, color, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  color === 'amber' ? 'bg-amber-100' : color === 'purple' ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  <Icon size={26} className={
                    color === 'amber' ? 'text-amber-600' : color === 'purple' ? 'text-purple-600' : 'text-green-600'
                  } />
                  <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                    color === 'amber' ? 'bg-amber-500' : color === 'purple' ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                    {step.replace('0', '')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editor Showcase ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(180deg, #0f0e17 0%, #1a1025 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">The Editor</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
                A canvas built for<br />non-linear stories
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                See your entire story structure at a glance. Drag scenes, draw connections, and instantly understand how every choice flows into the next moment.
              </p>
              <ul className="flex flex-col gap-3 text-sm">
                {[
                  'Drag-and-drop scene nodes onto an infinite canvas',
                  'Draw connections between scenes with choices',
                  'Mark scenes as Start, Scene, or Ending',
                  'Generate AI illustrations per scene',
                  'Preview your story at any time',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <Check size={15} className="text-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full max-w-2xl order-1 lg:order-2">
              <CanvasMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Reader Experience ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Phone mockup */}
            <div className="flex-1 flex justify-center">
              <ReaderMockup />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">The Reader</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
                A beautiful reading experience for your audience
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Readers get an immersive, mobile-friendly experience. Every scene loads instantly, choices feel natural, and AI images bring the story to life.
              </p>
              <ul className="flex flex-col gap-3 text-sm">
                {[
                  'Clean, distraction-free reading layout',
                  'Tap choices to navigate branches',
                  'AI-generated scene illustrations',
                  'Rate and review stories at the end',
                  'Works on any device — phone, tablet, desktop',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <Check size={15} className="text-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="bg-gray-50 border-t border-gray-100 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Everything you need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GitBranch, title: 'Visual Canvas', desc: 'Map your full story structure with drag-and-drop nodes on an infinite canvas.', color: 'amber' },
              { icon: Sparkles, title: 'AI Scene Images', desc: 'Auto-generate cinematic illustrations for every scene — no art skills required.', color: 'purple' },
              { icon: Share2, title: 'One-click Publish', desc: 'Share your story instantly with a public link. Control who can see it.', color: 'blue' },
              { icon: Users, title: 'Audience Controls', desc: 'Set age ratings (All Ages / Teens / Adults) and tag stories by genre.', color: 'green' },
              { icon: Star, title: 'Ratings & Reviews', desc: 'Readers rate and review stories. Build credibility through community feedback.', color: 'amber' },
              { icon: Zap, title: 'Fast & Responsive', desc: 'Stories load instantly on any device. Optimised for mobile and desktop.', color: 'orange' },
            ].map(({ icon: Icon, title, desc, color }) => {
              const bg: Record<string, string> = { amber: 'bg-amber-100', purple: 'bg-purple-100', blue: 'bg-blue-100', green: 'bg-green-100', orange: 'bg-orange-100' }
              const text: Record<string, string> = { amber: 'text-amber-600', purple: 'text-purple-600', blue: 'text-blue-600', green: 'text-green-600', orange: 'text-orange-600' }
              return (
                <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${bg[color]}`}>
                    <Icon size={20} className={text[color]} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b, #a78bfa, transparent)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to tell your story?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Join creators who are building branching adventures their readers love. It&apos;s free to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              onClick={() => analytics.landingSignInClicked('cta_bottom')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-gray-900 shadow-xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              Create a free account
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-gray-300 border border-white/15 hover:bg-white/5 hover:text-white transition-colors"
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
  const [adventures, setAdventures] = useState<AdventureWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/adventures')
      .then(r => r.json())
      .then(data => { setAdventures(data); setLoading(false) })
    fetch('/api/generate-images', { method: 'POST' })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this story?')) return
    await fetch(`/api/adventures/${id}`, { method: 'DELETE' })
    setAdventures(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Stories</h1>
          <p className="text-gray-500 mt-1">Create and play branching stories</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Story
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : adventures.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No stories yet. Create your first one!</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            <Plus size={18} />
            Create Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adventures.map(adventure => (
            <AdventureCard key={adventure.id} adventure={adventure} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Root ────────────────────────────────────────────────────────── */

export default function HomePage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="text-center py-20 text-gray-400">Loading…</div>
  }

  return status === 'authenticated' ? <Dashboard /> : <LandingPage />
}
