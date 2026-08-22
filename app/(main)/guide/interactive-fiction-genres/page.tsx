import type { Metadata } from 'next'
import Link from 'next/link'
import { Drama, Pencil, ArrowRight, Ghost, Search, HeartHandshake, Swords, Rocket, GraduationCap } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/interactive-fiction-genres`

export const metadata: Metadata = {
  title: { absolute: 'Interactive Fiction Genres — A Writer\'s Guide | StoryQuestor' },
  description: 'How branching structure interacts with genre conventions — from horror and mystery to romance, epic fantasy, sci-fi, and educational fiction.',
  keywords: ['interactive fiction genres', 'branching story genres', 'horror interactive fiction', 'romance interactive fiction', 'educational interactive fiction'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Interactive Fiction Genres — A Writer\'s Guide',
    description: 'How branching structure interacts with genre conventions across horror, mystery, romance, fantasy, sci-fi, and educational fiction.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Fiction Genres — A Writer\'s Guide',
    description: 'How branching structure interacts with genre conventions across six major genres.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const GENRES = [
  {
    icon: Ghost, name: 'Horror', color: 'rose',
    body: 'Horror thrives on irreversibility — a choice that can\'t be undone is far scarier than one that can. Limit backtracking, let resources (light, sanity, allies) drain rather than replenish, and consider making at least one wrong choice permanently close off the "safe" ending. Dread comes from consequence, not jump scares.',
  },
  {
    icon: Search, name: 'Mystery', color: 'blue',
    body: 'Mystery structure often inverts the usual branching model: instead of the plot branching from choices, investigation branches let the reader gather clues in any order before a mostly fixed resolution. A hub-and-spoke pattern — see branching story structure — fits naturally, with each spoke representing a suspect, location, or lead.',
  },
  {
    icon: HeartHandshake, name: 'Romance', color: 'pink',
    body: 'Romance lives or dies on relationship tracking — readers need to feel like their choices are actually building (or damaging) a connection over time. Attribute-based systems, like affinity or trust stats tied to specific characters, make this legible: a choice that raises one character\'s trust and lowers another\'s creates the genre\'s signature tension between multiple love interests.',
  },
  {
    icon: Swords, name: 'Fantasy & Adventure', color: 'amber',
    body: 'Epic-scale branching benefits from world state that persists across chapters — items found, allies recruited, reputations earned. This is where RPG-style mechanics (party stats, inventory, combat) tend to pay off most, since the genre\'s readers already expect that kind of accumulating agency from tabletop and video game traditions.',
  },
  {
    icon: Rocket, name: 'Sci-Fi', color: 'violet',
    body: 'Science fiction is well suited to moral-dilemma choices with delayed, systemic consequences — a decision in chapter one about a colony\'s resources pays off three chapters later in ways the reader couldn\'t have fully predicted. Time-loop and memory-altering premises also map unusually well onto the loop structural pattern.',
  },
  {
    icon: GraduationCap, name: 'Educational', color: 'teal',
    body: 'Branching scenarios are widely used to teach decision-making, history, and ethics, because letting a student make a choice and experience its consequence sticks better than being told the consequence directly. Keep the underlying lesson honest — avoid rigging every "wrong" choice to an obviously bad outcome, or the lesson becomes "guess what the author wants" rather than genuine reasoning.',
  },
]

const COLOR_MAP: Record<string, { ring: string; icon: string }> = {
  rose:   { ring: 'border-rose-200 bg-rose-50',    icon: 'text-rose-600' },
  blue:   { ring: 'border-blue-200 bg-blue-50',    icon: 'text-blue-600' },
  pink:   { ring: 'border-pink-200 bg-pink-50',    icon: 'text-pink-600' },
  amber:  { ring: 'border-amber-200 bg-amber-50',  icon: 'text-amber-600' },
  violet: { ring: 'border-violet-200 bg-violet-50', icon: 'text-violet-600' },
  teal:   { ring: 'border-teal-200 bg-teal-50',    icon: 'text-teal-600' },
}

export default function InteractiveFictionGenresPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Interactive Fiction Genres — A Writer\'s Guide',
    description: 'How branching structure interacts with genre conventions across horror, mystery, romance, fantasy, sci-fi, and educational fiction.',
    url: PAGE_URL,
    datePublished: '2026-08-22',
    dateModified: '2026-08-22',
    author: { '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guide', item: `${SITE_URL}/guide` },
      { '@type': 'ListItem', position: 3, name: 'Interactive Fiction Genres', item: PAGE_URL },
    ],
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-16 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <Drama size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Interactive Fiction<br /><span className="text-amber-400">Genres</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Genre doesn&apos;t just flavor a branching story — it changes which structural patterns and choice mechanics actually work.
          </p>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Why Genre Matters Structurally</p>
          <h2 id="genre-and-structure" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Genre Conventions Shape How Readers Expect Choices to Work
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              A mystery reader expects to gather evidence in whatever order they choose and still reach a satisfying resolution. A horror reader expects that a wrong decision can permanently cost them something. A romance reader expects their choices to accumulate into a relationship they can track. These aren&apos;t just tonal preferences — they&apos;re structural expectations, and ignoring them makes a branching story feel off even when the prose is strong.
            </p>
            <p>
              The good news: you don&apos;t need a different toolkit for each genre, just a different emphasis on the same tools covered elsewhere in this guide — <Link href="/guide/branching-story-structure" className="text-amber-700 underline underline-offset-2 font-medium">structural patterns</Link> and <Link href="/guide/how-to-create-meaningful-choices" className="text-amber-700 underline underline-offset-2 font-medium">meaningful choice design</Link>. What follows is how six major genres tend to use them differently.
            </p>
          </div>
        </div>
      </section>

      {/* ── Genre grid ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {GENRES.map(g => {
              const c = COLOR_MAP[g.color]
              return (
                <div key={g.name} className={`rounded-2xl border p-6 ${c.ring}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <g.icon size={20} className={c.icon} />
                    <h3 className="text-base font-bold" style={{ color: '#1e0a3c' }}>{g.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{g.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── World Builder callout ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Making It Concrete</p>
          <h2 id="genre-mechanics" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            Genres That Lean on Stats Need Stats
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              Fantasy, romance, and sci-fi in particular tend to benefit from visible, persistent stats — trust with a character, HP in a fight, resources in a colony sim. Prose alone can carry these genres, but readers raised on RPGs and visual novels often expect to <em>see</em> the numbers behind the story.
            </p>
            <p>
              StoryQuestor&apos;s <Link href="/how-to#world-builder" className="text-amber-300 underline underline-offset-2">World Builder mode</Link> supports this directly — custom attributes per character, stat effects on choices, and conditions that only reveal a choice once a stat crosses a threshold. A fantasy story can track party HP and gold; a romance can track affinity per love interest; a sci-fi story can track a colony&apos;s dwindling resources — all using the same underlying system.
            </p>
          </div>
        </div>
      </section>

      {/* ── Explore link ── */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-4">Curious what these genres look like in finished stories?</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            Browse stories by genre on Explore <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Continue the Series"
            items={[
              { href: '/guide/how-to-create-meaningful-choices', title: 'How to Create Meaningful Choices', description: 'Stakes, character revelation, and relationship change — the levers behind every genre\'s best choices.', tag: 'Guide' },
              { href: '/guide/branching-story-structure', title: 'Branching Story Structure Explained', description: 'Hubs, diamonds, and loops — which shape fits which kind of story.', tag: 'Guide' },
              { href: '/guide/how-to-write-multiple-endings', title: 'How to Write Multiple Endings', description: 'Designing endings that fit the tone of your genre, from triumphant to bittersweet.', tag: 'Guide' },
              { href: '/how-to', title: 'How to Use StoryQuestor', description: 'Set up World Builder stats, conditions, and combat for genre-appropriate mechanics.', tag: 'Product Guide' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Write in your genre, your way</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor supports everything from pure prose branching to full RPG-style stats and combat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 shadow-lg transition-all hover:scale-105">
              <Pencil size={16} />
              Start writing free
            </Link>
            <Link href="/guide"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              More writing guides <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
