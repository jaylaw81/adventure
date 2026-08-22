import type { Metadata } from 'next'
import Link from 'next/link'
import { Layers, Pencil, ArrowRight, GitMerge, GitBranch as GitBranchIcon, Milestone, RefreshCw, Waypoints } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/branching-story-structure`

export const metadata: Metadata = {
  title: { absolute: 'Branching Story Structure Explained | StoryQuestor' },
  description: 'Diamonds, hubs, gauntlets, and time caves — the handful of structural patterns almost every branching story is built from, and when to use each.',
  keywords: ['branching story structure', 'interactive fiction structure', 'diamond pattern', 'hub and spoke', 'time cave', 'gauntlet structure'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Branching Story Structure Explained',
    description: 'The handful of structural patterns almost every branching story is built from, and when to use each.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Branching Story Structure Explained',
    description: 'The handful of structural patterns almost every branching story is built from, and when to use each.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const PATTERNS = [
  {
    icon: GitMerge,
    name: 'The Diamond',
    color: 'amber',
    body: 'Paths branch at a decision point, stay diverged for a scene or two, then reconverge at a hub before the next major branch. The reader experiences different scenes, but the author only writes the convergence point once. This is the workhorse pattern of most finishable branching fiction — including much of the original Choose Your Own Adventure line.',
    good: 'Multi-chapter stories where you need branching to feel real without an exponential writing workload.',
  },
  {
    icon: Waypoints,
    name: 'Hub-and-Spoke',
    color: 'violet',
    body: 'A central location or chapter the reader returns to repeatedly, with several self-contained "spoke" scenes branching off it — think a home base between missions. Spokes can often be completed in any order, which makes this pattern naturally suited to exploration-driven stories.',
    good: 'Stories built around a location the reader keeps coming back to — an inn, a ship, a home base between quests.',
  },
  {
    icon: Milestone,
    name: 'The Gauntlet',
    color: 'blue',
    body: 'A mostly linear spine with occasional forks that reconverge almost immediately — small detours rather than major divergence. Choices still matter (they can affect stats, unlock lines of dialogue, or lead to a different final scene) but the overall shape stays close to linear.',
    good: 'Shorter stories, or authors writing their first branching piece who want structure to stay manageable.',
  },
  {
    icon: GitBranchIcon,
    name: 'The Time Cave',
    color: 'rose',
    body: 'A fully unrestricted tree — every choice leads somewhere genuinely new, with little or no reconvergence. This is the most exhilarating pattern to read and the most punishing to write, since the number of required scenes roughly doubles with every added level of choices.',
    good: 'Very short pieces (a handful of choices deep) where the full-tree cost stays bounded — rarely a good fit for anything longer.',
  },
  {
    icon: RefreshCw,
    name: 'The Loop',
    color: 'teal',
    body: 'The reader can return to an earlier state — a repeating day, a puzzle room they can re-enter — often carrying forward knowledge or items from previous attempts. Escaping the loop usually requires acting differently based on what was learned.',
    good: 'Mystery and puzzle-driven stories where the reader is meant to piece something together across multiple attempts.',
  },
]

const COLOR_MAP: Record<string, { ring: string; icon: string }> = {
  amber:  { ring: 'border-amber-200 bg-amber-50',  icon: 'text-amber-600' },
  violet: { ring: 'border-violet-200 bg-violet-50', icon: 'text-violet-600' },
  blue:   { ring: 'border-blue-200 bg-blue-50',    icon: 'text-blue-600' },
  rose:   { ring: 'border-rose-200 bg-rose-50',    icon: 'text-rose-600' },
  teal:   { ring: 'border-teal-200 bg-teal-50',    icon: 'text-teal-600' },
}

export default function BranchingStoryStructurePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Branching Story Structure Explained',
    description: 'The handful of structural patterns almost every branching story is built from, and when to use each.',
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
      { '@type': 'ListItem', position: 3, name: 'Branching Story Structure Explained', item: PAGE_URL },
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
            <Layers size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Branching Story<br /><span className="text-amber-400">Structure Explained</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Almost every branching story ever written is built from one of a handful of recurring shapes. Here&apos;s what they are and when to reach for each.
          </p>
        </div>
      </section>

      {/* ── Why structure matters ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Why It Matters</p>
          <h2 id="why-structure" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Unrestricted Branching Doesn&apos;t Scale
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Every branching story is, structurally, a graph: scenes are nodes, choices are the connections between them. If every choice leads to a genuinely new scene with no reconvergence, the number of scenes you need roughly doubles at every additional level of choices. Three choices deep with two options each is already 8 endings and dozens of scenes. Six levels deep is over 60 endings. Almost no one finishes writing that.
            </p>
            <p>
              This is why virtually every long branching story — from 1980s gamebooks to modern interactive apps — relies on a small set of structural patterns that let branches feel real to the reader while staying finishable for the author. Picking one deliberately, before you draft scenes, is the difference between a story you finish and one that stalls out three chapters in. If you haven&apos;t yet, read <Link href="/guide/how-to-write-branching-stories" className="text-amber-700 underline underline-offset-2 font-medium">how to write branching stories</Link> for the planning process this fits into.
            </p>
          </div>
        </div>
      </section>

      {/* ── Patterns ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Five Patterns</p>
          <h2 id="patterns" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            The Shapes Branching Stories Take
          </h2>
          <div className="flex flex-col gap-5">
            {PATTERNS.map(p => {
              const c = COLOR_MAP[p.color]
              return (
                <div key={p.name} className={`rounded-2xl border p-6 ${c.ring}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <p.icon size={20} className={c.icon} />
                    <h3 className="text-lg font-bold" style={{ color: '#1e0a3c' }}>{p.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{p.body}</p>
                  <p className="text-xs font-semibold text-gray-500">
                    <span className="uppercase tracking-wide">Best for:</span> {p.good}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Mixing patterns ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">In Practice</p>
          <h2 id="mixing-patterns" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Most Real Stories Mix Patterns
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              These patterns aren&apos;t mutually exclusive, and few finished stories use only one. A common approach: open with a gauntlet to establish tone and characters cheaply, introduce a diamond at the story&apos;s first major decision, then let a hub-and-spoke chapter give the reader room to explore before the climax pulls everyone back onto a shared final path.
            </p>
            <p>
              The goal isn&apos;t architectural purity — it&apos;s matching the shape to what the story needs at each point, while keeping the total scene count something you can actually finish writing. A story that stays 100% diamond from start to finish is often more predictable to readers than one that varies its shape.
            </p>
            <p>
              On StoryQuestor, chapters map naturally onto this idea — each chapter can use a different pattern, connected by Next Chapter scenes, with an Entry scene letting you route readers into a specific point in the next chapter based on the path they took. See <Link href="/how-to#chapters" className="text-amber-700 underline underline-offset-2 font-medium">organizing scenes into chapters</Link> for the mechanics.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Continue the Series"
            items={[
              { href: '/guide/how-to-write-branching-stories', title: 'How to Write Branching Stories', description: 'A step-by-step approach to planning and drafting a branching story from premise to first draft.', tag: 'Guide' },
              { href: '/guide/how-to-create-meaningful-choices', title: 'How to Create Meaningful Choices', description: 'The craft techniques that make a branch feel weighty instead of decorative.', tag: 'Guide' },
              { href: '/guide/how-to-write-multiple-endings', title: 'How to Write Multiple Endings', description: 'Designing endings that all feel earned, however the reader arrives.', tag: 'Guide' },
              { href: '/guide/what-is-interactive-fiction', title: 'What Is Interactive Fiction?', description: 'A complete introduction to the medium and how branching actually works under the hood.', tag: 'Guide' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">See your structure as you build it</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor&apos;s visual canvas lets you see your whole branching shape at a glance, chapter by chapter.
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
