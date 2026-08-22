import type { Metadata } from 'next'
import Link from 'next/link'
import { Library, ArrowRight, Scroll, Terminal, Film, BookOpen } from 'lucide-react'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://www.storyquestor.com'

export const metadata: Metadata = {
  title: { absolute: 'Interactive Fiction Resources — History & Reference | StoryQuestor' },
  description: 'The history of interactive fiction, text adventures, visual novels, and the Choose Your Own Adventure book series — a reference library for fans of branching stories.',
  alternates: { canonical: `${SITE_URL}/resources` },
}

interface ResourceEntry {
  slug: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  live: boolean
}

const RESOURCE_ENTRIES: ResourceEntry[] = [
  {
    slug: 'choose-your-own-adventure-history',
    title: 'Choose Your Own Adventure — History, Books & Series Guide',
    description: '184 books, 250 million copies sold — the complete story of the series that made branching books a household name.',
    icon: Scroll,
    live: true,
  },
  {
    slug: 'interactive-fiction-history',
    title: 'The History of Interactive Fiction',
    description: 'From 1970s gamebooks and mainframe text adventures to hypertext, visual novels, and modern branching apps.',
    icon: Library,
    live: true,
  },
  {
    slug: 'text-adventure-history',
    title: 'Text Adventure History',
    description: 'How Colossal Cave Adventure and Zork invented parser fiction — and why typing commands was once the whole genre.',
    icon: Terminal,
    live: true,
  },
  {
    slug: 'visual-novels-guide',
    title: 'The Visual Novel Guide',
    description: 'What a visual novel is, where the format came from, and the titles that defined it.',
    icon: Film,
    live: true,
  },
]

export default function ResourcesIndexPage() {
  const live = RESOURCE_ENTRIES.filter(e => e.live)
  const upcoming = RESOURCE_ENTRIES.filter(e => !e.live)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Interactive Fiction Resources',
    description: 'A reference library covering the history of interactive fiction, gamebooks, text adventures, and visual novels.',
    url: `${SITE_URL}/resources`,
    hasPart: live.map(e => ({
      '@type': 'Article',
      headline: e.title,
      url: `${SITE_URL}/resources/${e.slug}`,
    })),
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={schema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.3)' }}>
            <Library size={14} />
            Reference Library
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Interactive Fiction<br /><span className="text-amber-400">Resources</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            The history behind the medium — gamebooks, text adventures, visual novels, and the authors and publishers who built them.
          </p>
        </div>
      </section>

      {/* ── Live resources ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Start Here</p>
          <h2 className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>Read the History</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {live.map(entry => (
              <Link
                key={entry.slug}
                href={`/resources/${entry.slug}`}
                className="group flex flex-col rounded-2xl border border-violet-100 bg-white p-6 hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-4">
                  <entry.icon size={19} className="text-violet-600" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1e0a3c' }}>{entry.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{entry.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 group-hover:gap-2.5 transition-all">
                  Read more <ArrowRight size={13} />
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

      {/* ── Cross-link to Guide ── */}
      <section className="px-6 py-16" style={{ background: '#fffbeb' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-amber-100 bg-white p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">More to Explore</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#1e0a3c' }}>Looking for craft advice, not history?</h2>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Head over to the <strong>Guide</strong> for practical, step-by-step lessons on writing branching stories.
            </p>
          </div>
          <Link
            href="/guide"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 transition-all"
          >
            Browse the Guide <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Inspired by the history? Write the next chapter.</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor gives you a free visual canvas to build branching stories of your own.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white hover:brightness-110 shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              Start writing free
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              <BookOpen size={15} />
              Browse stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
