'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, BookOpen, GitBranch,
  Sparkles, ArrowRight, Check, Play, ChevronRight, Globe, BookMarked
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { analytics } from '@/lib/analytics'
import AdventureCard from '@/components/shared/AdventureCard'
import PageBanner from '@/components/shared/PageBanner'
import type { AdventureWithCounts } from '@/lib/queries'

/* ── Decorative sparkles ─────────────────────────────────────────── */

function HeroSparkles() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Scattered stars */}
      <circle cx="8%" cy="18%" r="1.5" fill="#a78bfa" style={{ animation: 'twinkle 3.2s ease-in-out infinite' }} />
      <circle cx="15%" cy="72%" r="1" fill="#f59e0b" style={{ animation: 'twinkle 4.1s ease-in-out infinite 0.8s' }} />
      <circle cx="78%" cy="12%" r="2" fill="#c4b5fd" style={{ animation: 'twinkle 2.8s ease-in-out infinite 0.3s' }} />
      <circle cx="88%" cy="62%" r="1.5" fill="#a78bfa" style={{ animation: 'twinkle 3.7s ease-in-out infinite 1.2s' }} />
      <circle cx="92%" cy="30%" r="1" fill="#f59e0b" style={{ animation: 'twinkle 5s ease-in-out infinite 0.5s' }} />
      <circle cx="4%" cy="45%" r="1" fill="#c4b5fd" style={{ animation: 'twinkle 4.5s ease-in-out infinite 2s' }} />
      <circle cx="55%" cy="88%" r="1.5" fill="#a78bfa" style={{ animation: 'twinkle 3.3s ease-in-out infinite 1.5s' }} />
      <circle cx="30%" cy="6%" r="1" fill="#f59e0b" style={{ animation: 'twinkle 4.8s ease-in-out infinite 0.2s' }} />
      <circle cx="68%" cy="78%" r="1" fill="#c4b5fd" style={{ animation: 'twinkle 3.9s ease-in-out infinite 0.9s' }} />
      {/* 4-pointed sparkle shapes */}
      <path d="M120,40 L122,36 L124,40 L122,44 Z" fill="#a78bfa" opacity="0.5" style={{ animation: 'twinkle 4s ease-in-out infinite 1s' }} />
      <path d="M700,80 L703,74 L706,80 L703,86 Z" fill="#f59e0b" opacity="0.4" style={{ animation: 'twinkle 5.2s ease-in-out infinite 0.4s' }} />
      <path d="M50,200 L52,195 L54,200 L52,205 Z" fill="#c4b5fd" opacity="0.45" style={{ animation: 'twinkle 3.6s ease-in-out infinite 1.8s' }} />
    </svg>
  )
}

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
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-violet-300 border border-violet-400/30 bg-violet-400/10">
          <Plus size={11} /> Add Scene
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white/40 border border-white/10">
          <Sparkles size={11} /> AI Image
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-violet-600">
          Publish
        </div>
      </div>
      {/* Editor body */}
      <div className="flex" style={{ background: '#0f0e17' }}>
        {/* Chapter sidebar */}
        <div className="w-36 shrink-0 border-r border-white/5 flex-col hidden sm:flex" style={{ background: '#0d0c1a' }}>
          <div className="px-3 py-2.5 border-b border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Chapters</p>
          </div>
          <div className="flex flex-col p-2 gap-1">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
              <BookMarked size={10} className="text-violet-400 shrink-0" />
              <span className="text-xs font-semibold text-violet-300 truncate">Chapter 1</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
              <BookMarked size={10} className="text-white/30 shrink-0" />
              <span className="text-xs text-white/40 truncate">Chapter 2</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
              <BookMarked size={10} className="text-white/30 shrink-0" />
              <span className="text-xs text-white/40 truncate">Chapter 3</span>
            </div>
          </div>
          <div className="mt-auto p-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] text-teal-400 border border-teal-500/20 bg-teal-500/10">
              <Plus size={9} /> Add Chapter
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="relative flex-1 h-60 overflow-hidden px-4 py-4" style={{ background: 'radial-gradient(ellipse at 30% 50%, #2d0b69 0%, #0f0e17 70%)' }}>
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
            <path d="M 118 64 C 160 64 165 52 200 52" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowViolet)" />
            <path d="M 118 78 C 160 78 165 106 200 106" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowAmber)" />
            <path d="M 305 52 C 340 52 348 64 368 64" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowViolet)" />
            <path d="M 305 106 C 340 106 352 80 368 76" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#arrowAmber)" />
            <defs>
              <marker id="arrowViolet" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#a78bfa" opacity="0.8" />
              </marker>
              <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#f59e0b" opacity="0.8" />
              </marker>
            </defs>
          </svg>
          {/* Start node */}
          <div className="absolute top-8 left-4 w-28 rounded-xl border border-green-500/40 shadow-lg" style={{ background: '#1a1025' }}>
            <div className="px-2.5 py-1.5 rounded-t-xl border-b border-green-500/30 bg-green-500/10 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-green-400">Start</span>
            </div>
            <div className="px-2.5 py-1.5">
              <p className="text-[10px] font-medium text-white leading-snug">The path splits before you…</p>
            </div>
          </div>
          {/* Scene A */}
          <div className="absolute top-2 left-[200px] w-28 rounded-xl border border-violet-500/30 shadow-lg" style={{ background: '#1a1025' }}>
            <div className="px-2.5 py-1.5 rounded-t-xl border-b border-violet-500/20 bg-violet-500/10 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[10px] font-semibold text-violet-400">Scene</span>
            </div>
            <div className="px-2.5 py-1.5">
              <p className="text-[10px] font-medium text-white leading-snug">Into the dark cave…</p>
            </div>
          </div>
          {/* Scene B */}
          <div className="absolute top-[72px] left-[200px] w-28 rounded-xl border border-amber-500/30 shadow-lg" style={{ background: '#1a1025' }}>
            <div className="px-2.5 py-1.5 rounded-t-xl border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400">Scene</span>
            </div>
            <div className="px-2.5 py-1.5">
              <p className="text-[10px] font-medium text-white leading-snug">The river flows east…</p>
            </div>
          </div>
          {/* Next Chapter node */}
          <div className="absolute top-[36px] left-[368px] w-28 rounded-xl border border-teal-400/40 shadow-lg" style={{ background: '#1a1025' }}>
            <div className="px-2.5 py-1.5 rounded-t-xl border-b border-teal-400/30 bg-teal-400/10 flex items-center gap-1.5">
              <BookMarked size={9} className="text-teal-400" />
              <span className="text-[10px] font-semibold text-teal-400">Next Chapter</span>
            </div>
            <div className="px-2.5 py-1.5">
              <p className="text-[10px] font-medium text-white/60 leading-snug">→ Chapter 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReaderMockup() {
  return (
    <div className="relative mx-auto w-72 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-violet-200"
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
          <div className="absolute bottom-2 right-2 text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded">AI scene</div>
        </div>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#1e0a3c' }}>
          The old wizard gestures toward two glowing portals. &ldquo;Choose wisely — each path leads to a different fate.&rdquo;
        </p>
        <div className="flex flex-col gap-2.5">
          <button className="w-full text-left px-4 py-2.5 rounded-xl border-2 border-violet-400 text-sm font-medium flex items-center justify-between"
            style={{ background: '#f5f3ff', color: '#5b21b6' }}>
            Step through the golden portal
            <ArrowRight size={14} className="text-violet-500" />
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl border border-violet-100 bg-white text-sm font-medium text-violet-700 flex items-center justify-between">
            Take the silver portal
            <ArrowRight size={14} className="text-violet-300" />
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl border border-violet-100 bg-white text-sm font-medium text-violet-700 flex items-center justify-between">
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
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      {/* -mt-16 pulls the hero behind the transparent sticky header (h-16 = 64px) */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 sm:pt-44 sm:pb-28 -mt-16"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 45%, #0f172a 100%)' }}>

        {/* Decorative radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(124,58,237,0.2) 0%, transparent 65%)' }}
        />
        <HeroSparkles />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
                style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.3)' }}>
                <Sparkles size={14} />
                Interactive Storytelling Platform
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight">
                Create Stories Where<br />
                <span className="text-amber-400">Every Choice Matters</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 mb-4 max-w-xl">
                Build branching adventures on a visual canvas. Add AI scene images. Share with readers who shape the outcome.
              </p>
              <p className="text-sm text-violet-300/70 mb-8 max-w-xl">
                Pay what you want, starting at $2/week. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/sign-up"
                  onClick={() => analytics.landingSignInClicked('hero')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  Start creating
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/demo"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white/80 border border-white/15 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Play size={15} />
                  Try the editor
                </Link>
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
      <section className="px-6 py-20" style={{ background: '#f5f3ff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1e0a3c' }}>
              From idea to adventure in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-11 left-1/3 right-1/3 h-px"
              style={{ background: 'linear-gradient(to right, #a78bfa, #7c3aed, #a78bfa)' }} />

            {[
              {
                step: '1',
                icon: GitBranch,
                bg: '#ede9fe',
                iconColor: '#7c3aed',
                badgeBg: '#7c3aed',
                title: 'Build your canvas',
                desc: 'Drag scenes onto an infinite canvas and connect them. Map every branch of your story visually.'
              },
              {
                step: '2',
                icon: Sparkles,
                bg: '#fef3c7',
                iconColor: '#d97706',
                badgeBg: '#f59e0b',
                title: 'Write & illustrate',
                desc: 'Write scene content and generate cinematic AI images for each moment — no design skills needed.'
              },
              {
                step: '3',
                icon: Globe,
                bg: '#fce7f3',
                iconColor: '#be185d',
                badgeBg: '#ec4899',
                title: 'Publish & share',
                desc: 'Hit publish and share your link. Readers play through every branch and discover every ending.'
              },
            ].map(({ step, icon: Icon, bg, iconColor, badgeBg, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4 bg-white rounded-2xl p-8 shadow-sm border border-violet-100">
                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: bg }}>
                  <Icon size={30} style={{ color: iconColor }} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-sm"
                    style={{ background: badgeBg }}>
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#1e0a3c' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reader Experience ── */}
      <section className="px-6 py-20" style={{ background: '#fffbeb' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Phone mockup */}
            <div className="flex-1 flex justify-center">
              <ReaderMockup />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">The Reader</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-5" style={{ color: '#1e0a3c' }}>
                A beautiful reading experience for your audience
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#6b7280' }}>
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
                  <li key={item} className="flex items-center gap-3" style={{ color: '#374151' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                      style={{ background: '#7c3aed' }}>
                      <Check size={12} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">What you get</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1e0a3c' }}>
              Built for the story, not the software
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-violet-100">
            {[
              { num: '01', title: 'Visual Canvas', desc: 'Map your full story structure with drag-and-drop scene nodes on an infinite canvas. See every branch at a glance.' },
              { num: '02', title: 'Chapters', desc: 'Break long stories into chapters — each with its own scenes, branches, and a smooth "Next Chapter" transition.' },
              { num: '03', title: 'AI Scene Images', desc: 'Auto-generate cinematic illustrations for every scene. No art skills required — just write the content and let the model paint the moment.' },
              { num: '04', title: 'One-click Publish', desc: 'Share your story with a public link. Built-in validation catches dead ends before your readers do.' },
              { num: '05', title: 'Audience Controls', desc: 'Set age ratings and genre tags. Reach the right readers with the right story.' },
              { num: '06', title: 'Ratings & Reviews', desc: 'Readers rate and review. Build credibility through community feedback across every ending they discover.' },
              { num: '07', title: 'Pay What You Want', desc: 'Creating and editing stories requires a subscription — starting at just $2/week, you choose the amount. Reading and browsing are always free.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-6 sm:gap-10 py-6 group">
                <span className="text-xs font-mono text-violet-300 pt-1.5 w-6 shrink-0">{num}</span>
                <h3 className="text-base font-bold w-40 shrink-0 group-hover:text-violet-600 transition-colors"
                  style={{ color: '#1e0a3c' }}>{title}</h3>
                <p className="text-sm leading-relaxed flex-1 hidden sm:block" style={{ color: '#6b7280' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)' }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.25) 0%, transparent 70%)' }}
        />
        <HeroSparkles />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to tell your story?
          </h2>
          <p className="text-white/60 text-lg mb-3 max-w-lg mx-auto">
            Join creators building branching adventures their readers love.
          </p>
          <p className="text-violet-300/60 text-sm mb-10">
            Pay what you want from $2/week. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              onClick={() => analytics.landingSignInClicked('cta_bottom')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              Start creating
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-white/70 border border-white/15 hover:bg-white/5 hover:text-white transition-colors"
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

  return (
    <>
      <PageBanner
        title={firstName ? `${firstName}'s Stories` : 'Your Stories'}
        subtitle="Create and play branching adventures"
        action={
          <Link
            href="/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-sm whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
          >
            <Plus size={18} />
            New Story
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showPrivateNudge && (() => {
          const n = adventures.filter(a => !a.isPublic).length
          return n > 0 ? (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Globe size={14} className="text-amber-500 shrink-0" />
              <span>
                You have {n} private {n === 1 ? 'story' : 'stories'} — toggle &ldquo;Make public&rdquo; on any card to share {n === 1 ? 'it' : 'them'} with the world.
              </span>
              <button onClick={dismissPrivateNudge} className="ml-auto text-amber-400 hover:text-amber-600 text-xs shrink-0">✕</button>
            </div>
          ) : null
        })()}
        {imagesGenerated > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm text-violet-800">
            <Sparkles size={14} className="text-violet-500 shrink-0" />
            AI images generated for {imagesGenerated} scene{imagesGenerated !== 1 ? 's' : ''}. Open a story to see them.
            <button onClick={() => setImagesGenerated(0)} className="ml-auto text-violet-400 hover:text-violet-600 text-xs">✕</button>
          </div>
        )}
        {imagesGenerating && !imagesGenerated && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-2.5 text-xs text-violet-400">
            <Sparkles size={13} className="text-violet-300 shrink-0 animate-pulse" />
            Checking for scenes to illustrate…
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-violet-400">Loading…</div>
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
              <AdventureCard key={adventure.id} adventure={adventure} onDelete={handleDelete} canMakePublic={canMakePublic} />
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
    return <div className="text-center py-20 text-violet-400">Loading…</div>
  }

  return status === 'authenticated' ? <Dashboard /> : <LandingPage />
}
