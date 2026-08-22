import type { Metadata } from 'next'
import Link from 'next/link'
import { Flag, Pencil, ArrowRight, Sparkles, Skull, HelpCircle, Lock } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/how-to-write-multiple-endings`

export const metadata: Metadata = {
  title: { absolute: 'How to Write Multiple Endings | StoryQuestor' },
  description: 'Designing endings that all feel earned in a branching story, so readers who explore every path are rewarded rather than punished.',
  keywords: ['how to write multiple endings', 'branching story endings', 'interactive fiction endings', 'good ending bad ending'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'How to Write Multiple Endings',
    description: 'Designing endings that all feel earned, so readers who explore every path are rewarded rather than punished.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Write Multiple Endings',
    description: 'Designing endings that all feel earned, so readers who explore every path are rewarded rather than punished.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const ENDING_TYPES = [
  { icon: Sparkles, title: 'Triumphant', body: 'The clear victory. Even here, avoid making it feel like the only ending that "counts" — that trains readers to treat every other ending as a loss.' },
  { icon: Skull, title: 'Bittersweet', body: 'The reader survives, but at a cost — a friend lost, a goal abandoned. Often the most memorable ending because it reflects the messiness of the choices that led there.' },
  { icon: HelpCircle, title: 'Twist', body: 'Recontextualizes a choice the reader made earlier. Powerful, but only fair if the twist was foreshadowed — a twist with no clues feels like a trick, not a payoff.' },
  { icon: Lock, title: 'Secret / hidden', body: 'Reachable only through a very specific, often counter-intuitive path. Rewards close readers and re-players, and — done right — becomes the story\'s most talked-about ending.' },
]

export default function HowToWriteMultipleEndingsPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Write Multiple Endings',
    description: 'Designing endings that all feel earned, so readers who explore every path are rewarded rather than punished.',
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
      { '@type': 'ListItem', position: 3, name: 'How to Write Multiple Endings', item: PAGE_URL },
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
            <Flag size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            How to Write<br /><span className="text-amber-400">Multiple Endings</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            In linear fiction there&apos;s one ending to get right. In branching fiction there might be a dozen — and every one has to be earned.
          </p>
        </div>
      </section>

      {/* ── The one true ending trap ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">The Core Trap</p>
          <h2 id="one-true-ending" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Avoid the &ldquo;One True Ending&rdquo; Trap
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              The most common mistake in multi-ending stories is writing one polished, satisfying &ldquo;real&rdquo; ending and treating every other ending as a failure state — a short paragraph of consequence, or worse, just &ldquo;You Died. The End.&rdquo;
            </p>
            <p>
              This punishes exactly the readers who engaged with your story the most: the ones who explored, took risks, and made choices that didn&apos;t obviously lead toward victory. If exploring is punished, readers learn not to explore — they&apos;ll consult a walkthrough or simply stop replaying, and you lose the replayability that makes branching fiction worth writing in the first place.
            </p>
            <p>
              Every ending doesn&apos;t need equal narrative real estate — your triumphant ending can be the longest and most detailed. But every ending needs to feel like <em>a real place the story could have gone</em>, not a punishment screen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Types ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Ending Types</p>
          <h2 id="ending-types" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            Four Kinds of Endings Worth Writing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ENDING_TYPES.map(e => (
              <div key={e.title} className="rounded-2xl border border-violet-100 bg-white p-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-4">
                  <e.icon size={18} className="text-violet-600" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{e.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The secret ending phenomenon ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Case Study</p>
          <h2 id="secret-ending" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            What a Great Secret Ending Can Do
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              One of the best-documented examples of a secret ending&apos;s power comes from the Choose Your Own Adventure series. <em>Inside UFO 54-40</em> included an ending — reaching the utopian planet Ultima — that legend said could <em>never</em> be found by making choices in the normal way, only by accident. It sparked years of playground debate among readers comparing notes, becoming one of the most talked-about entries in the entire series. Read the full story in our <Link href="/resources/choose-your-own-adventure-history" className="text-amber-700 underline underline-offset-2 font-medium">Choose Your Own Adventure history</Link>.
            </p>
            <p>
              What made it work wasn&apos;t obscurity for its own sake — it was that finding it felt like discovering something the story hadn&apos;t explicitly told you existed. That instinct — reward curiosity with content nobody else has seen — is exactly what makes secret endings worth the extra writing effort today, whether in a gamebook or a modern branching app.
            </p>
          </div>
        </div>
      </section>

      {/* ── Practical structure ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Practical Structure</p>
          <h2 id="how-many-endings" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            How Many Endings Do You Actually Need?
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              There&apos;s no universal number — but a useful rule of thumb for a first branching story is three to five distinct endings, each reachable from a meaningfully different set of major choices. Fewer than that and the branches stop feeling consequential; many more and you risk spreading your writing time so thin that no single ending lands well.
            </p>
            <p>
              Endings don&apos;t all need unique final scenes from scratch — many strong branching stories use a small number of &ldquo;ending frames&rdquo; (triumphant, bittersweet, twist) and vary the specific details based on which choices the reader made along the way. This keeps the writing workload manageable while still making every path feel distinct. It pairs naturally with the convergence patterns covered in <Link href="/guide/branching-story-structure" className="text-amber-300 underline underline-offset-2">branching story structure explained</Link>.
            </p>
            <p>
              On StoryQuestor, each Ending node is its own scene — build a handful of them, then route your Choice paths so different combinations of decisions lead to the ending that actually fits what the reader did.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Continue the Series"
            items={[
              { href: '/guide/how-to-create-meaningful-choices', title: 'How to Create Meaningful Choices', description: 'Why some branches feel weighty and others feel fake — the levers that make a choice land.', tag: 'Guide' },
              { href: '/guide/branching-story-structure', title: 'Branching Story Structure Explained', description: 'The structural patterns that make multiple endings manageable to write.', tag: 'Guide' },
              { href: '/resources/choose-your-own-adventure-history', title: 'Choose Your Own Adventure History', description: 'The full story behind the "secret ending" phenomenon and the series that popularized it.', tag: 'Resources' },
              { href: '/guide/how-to-write-branching-stories', title: 'How to Write Branching Stories', description: 'A step-by-step approach to planning and drafting a branching story.', tag: 'Guide' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Build every ending on one canvas</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor shows your reachable ending count right on the home page — a quick way to gauge story depth as you write.
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
