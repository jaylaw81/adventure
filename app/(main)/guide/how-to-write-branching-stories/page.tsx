import type { Metadata } from 'next'
import Link from 'next/link'
import { GitBranch, Pencil, ArrowRight, Lightbulb, Map, ListChecks, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/how-to-write-branching-stories`

export const metadata: Metadata = {
  title: { absolute: 'How to Write Branching Stories | StoryQuestor' },
  description: 'A practical, step-by-step approach to planning and drafting a branching story — from premise to node map to first draft — without losing track of your own plot.',
  keywords: ['how to write a branching story', 'interactive fiction writing', 'branching narrative', 'choose your own adventure writing tips'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'How to Write Branching Stories',
    description: 'A practical, step-by-step approach to planning and drafting a branching story without losing track of your own plot.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Write Branching Stories',
    description: 'A practical, step-by-step approach to planning and drafting a branching story without losing track of your own plot.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const PITFALLS = [
  { title: 'Writing the diagram before the story', body: 'Nodes and arrows are a planning tool, not a source of drama. If you can\'t summarize your premise in two sentences without mentioning choices, you don\'t have a story yet — you have a flowchart.' },
  { title: 'False choices', body: 'Two options that lead to the same next scene, or where one is an obvious dead end, teach readers to stop trusting your choices. Every fork should feel like it could plausibly go either way.' },
  { title: 'Unbounded branching', body: 'Two real choices per scene doubles your workload every level deeper. Without a converging structure, most authors run out of steam around chapter two.' },
  { title: 'Forgetting what the reader knows', body: 'On a converging path, readers arrive from different histories. Reference earlier events carefully — vaguely enough to work from any incoming path, specifically enough to still feel earned.' },
]

export default function HowToWriteBranchingStoriesPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Write Branching Stories',
    description: 'A practical, step-by-step approach to planning and drafting a branching story without losing track of your own plot.',
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
      { '@type': 'ListItem', position: 3, name: 'How to Write Branching Stories', item: PAGE_URL },
    ],
  }
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Write a Branching Story',
    description: 'A step-by-step approach to planning and drafting a branching story.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Write the premise first', text: 'Summarize the story in two sentences with no mention of branching before you plan any structure.' },
      { '@type': 'HowToStep', position: 2, name: 'Choose a structural pattern', text: 'Pick a branching pattern — diamond, hub-and-spoke, or gauntlet — that matches the scope you can realistically finish.' },
      { '@type': 'HowToStep', position: 3, name: 'Map key decision points before scenes', text: 'List the handful of choices that matter most before writing any prose, so the map stays manageable.' },
      { '@type': 'HowToStep', position: 4, name: 'Draft one path fully, then branch', text: 'Write a complete beginning-to-end path first to nail tone and pacing, then write the divergent scenes around it.' },
      { '@type': 'HowToStep', position: 5, name: 'Revise for the reader who arrives sideways', text: 'Re-read converging scenes assuming the reader took a different path in — cut references that only make sense from one entry point.' },
    ],
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-16 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <GitBranch size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            How to Write<br /><span className="text-amber-400">Branching Stories</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            A practical process for drafting a story with multiple paths — without losing track of your own plot halfway through.
          </p>
        </div>
      </section>

      {/* ── Step 1 ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Step 1</p>
          <h2 id="premise-first" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Write the Premise Before the Structure
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              The single most common way branching stories fail isn&apos;t bad prose — it&apos;s starting with the wrong document. New authors open a canvas, drop a Start node, and start drawing branches before they know what the story is actually about. What emerges is a maze with narration attached to it, not a story.
            </p>
            <p>
              Write your premise the same way you would for any story: protagonist, want, obstacle, uncertainty. &ldquo;A courier must decide whether to deliver a letter that could start a war, or destroy it and betray her employer&rdquo; is a premise. It has stakes and a real question before a single choice node exists. Only once you have that do you start thinking about where the branches go.
            </p>
            <p>
              This matters more in branching fiction than linear fiction, not less — because every branch you add either serves that central question or dilutes it. A clear premise is what lets you say no to a clever-but-irrelevant subplot three chapters in.
            </p>
          </div>
        </div>
      </section>

      {/* ── Step 2 ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center">
              <Map size={18} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Step 2</p>
              <h2 id="pick-a-shape" className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>Pick a Structural Shape That Matches Your Scope</h2>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Before mapping individual scenes, decide roughly how your branches will behave: do they diverge and reconverge at hub points, radiate outward from a central location, or run mostly straight with the occasional fork? This single decision determines whether your story is finishable in a reasonable amount of writing time.
            </p>
            <p>
              A short story with three real endings can afford a fully unrestricted tree. A novel-length piece almost never can — the math simply doesn&apos;t work. We cover the standard shapes and when to use each in <Link href="/guide/branching-story-structure" className="text-violet-700 underline underline-offset-2 font-medium">branching story structure explained</Link>; pick one before you draft a single scene.
            </p>
          </div>
        </div>
      </section>

      {/* ── Step 3 ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <ListChecks size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Step 3</p>
              <h2 id="map-decisions" className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>Map the Handful of Decisions That Matter</h2>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              You don&apos;t need to plan every scene before you write — you need to identify the two or three <em>major</em> decision points that will define the shape of the whole story. What are the choices that would genuinely change which story the reader ends up reading? Everything else can be discovered while drafting.
            </p>
            <p>
              A useful outlining trick: write down each major decision point as a single sentence describing what the reader is actually choosing between — not the surface action, but the underlying tension. &ldquo;Open the door or flee&rdquo; is surface. &ldquo;Trust a stranger or protect yourself&rdquo; is the real choice underneath it. Naming the real choice makes it much easier to write both branches with equal weight, which is the subject of <Link href="/guide/how-to-create-meaningful-choices" className="text-amber-700 underline underline-offset-2 font-medium">how to create meaningful choices</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Step 4 ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Pencil size={18} className="text-violet-400" />
            </div>
            <h2 id="draft-a-spine" className="text-2xl sm:text-3xl font-extrabold text-white">Draft One Complete Path First</h2>
          </div>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              Write one full beginning-to-end path — the &ldquo;spine&rdquo; — before you write any of the branching scenes around it. This does two things: it forces you to actually finish something, and it establishes tone, pacing, and voice that every branch needs to match.
            </p>
            <p>
              Trying to write branches and the spine simultaneously is how most unfinished branching stories die. Writers get lost jumping between paths, lose track of tone, and burn out before reaching a single ending. A finished spine is a finished, readable story on its own — everything after that is expansion, not a race against an unfinished draft.
            </p>
            <p>
              On a visual canvas like StoryQuestor&apos;s, this looks like: build your Start scene and one full chain of Scene nodes down to an Ending, mark each Done as you go, then come back and add the branching choices and alternate scenes once the spine reads well start to finish. See <Link href="/how-to#creating" className="text-violet-300 underline underline-offset-2">how to build scenes and chapters</Link> for the mechanics.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pitfalls ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 id="pitfalls" className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>Four Pitfalls That Stall Branching Stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PITFALLS.map(p => (
              <div key={p.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tip callout ── */}
      <section className="px-6 py-16" style={{ background: '#fffbeb' }}>
        <div className="max-w-3xl mx-auto flex items-start gap-4 rounded-2xl border border-amber-100 bg-white p-8">
          <Lightbulb size={20} className="text-amber-500 shrink-0 mt-1" />
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-900">One more thing:</strong> plan your endings early, even before you&apos;ve written every branch. Knowing where each major path is <em>headed</em> keeps every scene along the way purposeful. See <Link href="/guide/how-to-write-multiple-endings" className="text-amber-700 underline underline-offset-2 font-medium">how to write multiple endings</Link> for the craft behind landing each one.
          </p>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Continue the Series"
            items={[
              { href: '/guide/how-to-create-meaningful-choices', title: 'How to Create Meaningful Choices', description: 'Why some branches feel weighty and others feel fake — and the craft techniques that separate the two.', tag: 'Guide' },
              { href: '/guide/branching-story-structure', title: 'Branching Story Structure Explained', description: 'The handful of structural patterns almost every branching story is built from.', tag: 'Guide' },
              { href: '/guide/how-to-write-multiple-endings', title: 'How to Write Multiple Endings', description: 'Designing endings that all feel earned, so exploring never feels like a punishment.', tag: 'Guide' },
              { href: '/guide/what-is-interactive-fiction', title: 'What Is Interactive Fiction?', description: 'A complete introduction to the medium and the forms it takes.', tag: 'Guide' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Draft your spine on a visual canvas</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor lets you write scenes and connect choices by dragging a line — plan the shape and write the prose in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 shadow-lg transition-all hover:scale-105">
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
