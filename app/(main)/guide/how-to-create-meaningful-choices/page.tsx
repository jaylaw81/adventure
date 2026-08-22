import type { Metadata } from 'next'
import Link from 'next/link'
import { Split, Pencil, ArrowRight, Heart, Users, DoorClosed, Scale } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/how-to-create-meaningful-choices`

export const metadata: Metadata = {
  title: { absolute: 'How to Create Meaningful Choices in Interactive Fiction | StoryQuestor' },
  description: 'Why some branching choices feel weighty and others feel fake, and the craft techniques — stakes, character, consequence — that separate the two.',
  keywords: ['meaningful choices', 'branching narrative design', 'interactive fiction writing', 'false choice', 'choice design'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'How to Create Meaningful Choices',
    description: 'Why some branching choices feel weighty and others feel fake, and the craft techniques that separate the two.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Create Meaningful Choices',
    description: 'Why some branching choices feel weighty and others feel fake, and the craft techniques that separate the two.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const LEVERS = [
  { icon: Scale, title: 'Stakes', body: 'A meaningful choice costs the reader something no matter which option they pick. If one option is obviously free of consequence, it isn\'t really a choice — it\'s a formality.' },
  { icon: Heart, title: 'Character revelation', body: 'The choice should say something true about who the protagonist is. Readers remember choices that felt like a values test, not just a fork in the road.' },
  { icon: Users, title: 'Relationship & world change', body: 'A choice gains weight when it visibly changes how another character treats the reader, or closes off a piece of the world for good.' },
]

export default function HowToCreateMeaningfulChoicesPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Create Meaningful Choices in Interactive Fiction',
    description: 'Why some branching choices feel weighty and others feel fake, and the craft techniques that separate the two.',
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
      { '@type': 'ListItem', position: 3, name: 'How to Create Meaningful Choices', item: PAGE_URL },
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
            <Split size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            How to Create<br /><span className="text-amber-400">Meaningful Choices</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            The one skill that decides whether your branching story feels alive or feels like a maze with narration attached.
          </p>
        </div>
      </section>

      {/* ── The false choice problem ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
              <DoorClosed size={18} className="text-red-500" />
            </div>
            <h2 id="false-choices" className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>
              The False Choice Problem
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              A false choice is any decision point where the options don&apos;t actually diverge in any way the reader cares about — one leads to an immediate dead end, both routes converge one scene later with no acknowledgment of the detour, or the &ldquo;wrong&rdquo; option simply punishes the reader for choosing it.
            </p>
            <p>
              Readers detect false choices fast, usually by the second or third one. Once they do, they stop engaging with your choices as decisions and start treating them as decoration — clicking through without reading, because they&apos;ve learned it doesn&apos;t matter. That&apos;s the single fastest way to lose the thing that makes interactive fiction worth writing in the first place.
            </p>
            <p>
              The fix isn&apos;t &ldquo;never converge paths&rdquo; — convergence is necessary craft, covered in <Link href="/guide/branching-story-structure" className="text-amber-700 underline underline-offset-2 font-medium">branching story structure</Link>. The fix is making sure every choice changes <em>something</em> the reader can perceive, even on a path that later reconverges.
            </p>
          </div>
        </div>
      </section>

      {/* ── Three levers ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">The Craft</p>
          <h2 id="three-levers" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            Three Levers That Make a Choice Feel Real
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {LEVERS.map(lever => (
              <div key={lever.title} className="rounded-2xl border border-violet-100 bg-white p-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-4">
                  <lever.icon size={18} className="text-violet-600" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{lever.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{lever.body}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-8 leading-relaxed">
            A choice doesn&apos;t need all three — even one, applied deliberately, lifts it far above a coin flip. The best choices in interactive fiction usually combine at least two.
          </p>
        </div>
      </section>

      {/* ── Wants vs wants, not good vs evil ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Craft Technique</p>
          <h2 id="want-vs-want" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Write &ldquo;Want vs. Want,&rdquo; Not &ldquo;Good vs. Evil&rdquo;
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              The weakest branching choices offer a clearly good option and a clearly bad one. Readers pick the good one on reflex, and the &ldquo;choice&rdquo; becomes an exercise in identifying which button is labeled correctly rather than a real decision.
            </p>
            <p>
              The strongest choices put two things the reader genuinely wants — or two things they genuinely fear — directly against each other. &ldquo;Save the hostage, risking your only escape route&rdquo; forces a real trade-off between two legitimate values: safety and loyalty. There&apos;s no obviously correct answer, which is exactly what makes the reader pause and actually think before clicking.
            </p>
            <p>
              A quick test while drafting: if you can predict which option 95% of readers will pick without thinking, the choice needs more tension. Rewrite it so both options cost something real.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mechanics section — StoryQuestor specific ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Making It Concrete</p>
          <h2 id="stakes-you-can-see" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            Give Readers Stakes They Can See
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              Prose alone can carry stakes, but visible stakes — a relationship meter, a resource that runs out, a stat that changes — make consequences legible in a way readers immediately understand, even skimming. This is why so many modern interactive fiction platforms pair branching text with lightweight game mechanics.
            </p>
            <p>
              StoryQuestor&apos;s <Link href="/how-to#world-builder" className="text-amber-300 underline underline-offset-2">World Builder mode</Link> lets you attach <strong className="text-white">stat effects</strong> to any choice — HP, trust, gold, whatever attributes your story tracks — and set <strong className="text-white">conditions</strong> that hide a choice unless the reader&apos;s stats qualify. A choice that visibly costs 10 HP, or that only appears because an earlier choice raised the reader&apos;s Strength, communicates weight instantly, without needing a paragraph of exposition to explain it.
            </p>
            <p>
              You don&apos;t need game mechanics to write meaningful choices — plenty of great interactive fiction uses prose alone. But if your story already leans toward RPG-style stakes, visible stats are one of the fastest ways to make consequences land.
            </p>
          </div>
        </div>
      </section>

      {/* ── Checklist ── */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-3xl mx-auto rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h2 className="text-lg font-bold mb-5" style={{ color: '#1e0a3c' }}>Quick Test: Is This Choice Meaningful?</h2>
          <ul className="flex flex-col gap-3">
            {[
              'Could a reasonable reader pick either option? (If one is obviously correct, rewrite it.)',
              'Does each option cost the reader something — time, safety, a relationship, information?',
              'Do the resulting scenes actually differ, not just in wording but in content?',
              'If these paths reconverge later, does the story acknowledge which one the reader took?',
              'Does this choice reveal something about the protagonist\'s values?',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Continue the Series"
            items={[
              { href: '/guide/how-to-write-branching-stories', title: 'How to Write Branching Stories', description: 'A step-by-step approach to planning and drafting a branching story from premise to first draft.', tag: 'Guide' },
              { href: '/guide/how-to-write-multiple-endings', title: 'How to Write Multiple Endings', description: 'Designing endings that all feel earned, so exploring never feels like a punishment.', tag: 'Guide' },
              { href: '/guide/branching-story-structure', title: 'Branching Story Structure Explained', description: 'Diamonds, hubs, and gauntlets — the structural patterns branching stories are built from.', tag: 'Guide' },
              { href: '/how-to', title: 'How to Use StoryQuestor', description: 'A hands-on walkthrough of building choices, stat effects, and conditions on the canvas.', tag: 'Product Guide' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Give your choices real stakes</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor lets you attach stat effects and conditions to any choice — no code required.
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
