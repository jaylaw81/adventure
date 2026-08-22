import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, GitBranch, Split, Flag, Layers, Drama, Pencil } from 'lucide-react'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://www.storyquestor.com'

export const metadata: Metadata = {
  title: { absolute: 'The Interactive Fiction Writing Guide | StoryQuestor' },
  description: 'Learn how to write branching stories, craft meaningful choices, and structure interactive fiction — a growing library of practical guides for storytellers.',
  alternates: { canonical: `${SITE_URL}/guide` },
}

interface GuideEntry {
  slug: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  live: boolean
}

const GUIDE_ENTRIES: GuideEntry[] = [
  {
    slug: 'what-is-interactive-fiction',
    title: 'What Is Interactive Fiction?',
    description: 'A complete introduction to the medium — what makes a story "interactive," the major forms it takes, and how it differs from a video game or a novel.',
    icon: BookOpen,
    live: true,
  },
  {
    slug: 'how-to-write-branching-stories',
    title: 'How to Write Branching Stories',
    description: 'A practical, step-by-step approach to planning and drafting a story with multiple paths without losing track of your own plot.',
    icon: GitBranch,
    live: true,
  },
  {
    slug: 'how-to-create-meaningful-choices',
    title: 'How to Create Meaningful Choices',
    description: 'Why some branching choices feel weighty and others feel fake — and the craft techniques that separate the two.',
    icon: Split,
    live: true,
  },
  {
    slug: 'how-to-write-multiple-endings',
    title: 'How to Write Multiple Endings',
    description: 'Designing endings that all feel earned, so readers who explore every path are rewarded rather than punished.',
    icon: Flag,
    live: true,
  },
  {
    slug: 'branching-story-structure',
    title: 'Branching Story Structure Explained',
    description: 'Diamonds, hubs, gauntlets, and time-loops — the handful of structural patterns almost every branching story is built from.',
    icon: Layers,
    live: true,
  },
  {
    slug: 'interactive-fiction-genres',
    title: 'Interactive Fiction Genres',
    description: 'How branching structure interacts with genre conventions — from horror and mystery to romance and epic fantasy.',
    icon: Drama,
    live: true,
  },
]

export default function GuideIndexPage() {
  const live = GUIDE_ENTRIES.filter(e => e.live)
  const upcoming = GUIDE_ENTRIES.filter(e => !e.live)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The Interactive Fiction Writing Guide',
    description: 'A growing library of practical guides for writing branching, interactive stories.',
    url: `${SITE_URL}/guide`,
    hasPart: live.map(e => ({
      '@type': 'Article',
      headline: e.title,
      url: `${SITE_URL}/guide/${e.slug}`,
    })),
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={schema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <Pencil size={14} />
            Writing Craft
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            The Interactive Fiction<br />
            <span className="text-amber-400">Writing Guide</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Practical, craft-focused guides for anyone writing branching stories — whether you&apos;re plotting your first choose-your-own-adventure or refining your tenth.
          </p>
        </div>
      </section>

      {/* ── Live guides ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Start Here</p>
          <h2 className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>Guides</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {live.map(entry => (
              <Link
                key={entry.slug}
                href={`/guide/${entry.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 hover:border-amber-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4">
                  <entry.icon size={19} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1e0a3c' }}>{entry.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{entry.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:gap-2.5 transition-all">
                  Read the guide <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>

          {/* Coming soon list */}
          {upcoming.length > 0 && (
            <div className="mt-14 pt-10 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Coming Soon</p>
              <div className="flex flex-col divide-y divide-gray-100">
                {upcoming.map(entry => (
                  <div key={entry.slug} className="flex items-center gap-4 py-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <entry.icon size={15} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">{entry.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Cross-link to Resources ── */}
      <section className="px-6 py-16" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-violet-100 bg-white p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-2">More to Explore</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#1e0a3c' }}>Looking for the history, not the how-to?</h2>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Head over to <strong>Resources</strong> for the origins of interactive fiction, text adventures, visual novels, and the Choose Your Own Adventure book series.
            </p>
          </div>
          <Link
            href="/resources"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            Browse Resources <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Ready to put the craft into practice?</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor gives you a visual canvas to build branching stories — no code, just choices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 shadow-lg transition-all hover:scale-105">
              Start writing free
            </Link>
            <Link href="/how-to"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              See how StoryQuestor works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
