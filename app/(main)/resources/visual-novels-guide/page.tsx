import type { Metadata } from 'next'
import Link from 'next/link'
import { Film, ArrowRight, Pencil, Music, Image as ImageIcon, GitBranch, Users2 } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/resources/visual-novels-guide`

export const metadata: Metadata = {
  title: { absolute: 'The Visual Novel Guide | StoryQuestor' },
  description: 'What a visual novel is, where the format came from, the difference between kinetic and branching novels, and the titles that defined the genre.',
  keywords: ['visual novel', 'visual novel history', 'what is a visual novel', 'Otogirisou', 'kinetic novel', 'dating sim'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'The Visual Novel Guide',
    description: 'What a visual novel is, where the format came from, and the titles that defined the genre.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Visual Novel Guide',
    description: 'What a visual novel is, where the format came from, and the titles that defined the genre.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const ANATOMY = [
  { icon: ImageIcon, title: 'Character Sprites & Backgrounds', body: 'Static or lightly animated character art layered over a background image, swapped as the scene and speaker change — the format\'s signature look.' },
  { icon: Music, title: 'Music & Voice', body: 'A looping music track sets mood per scene, often paired with partial or full voice acting for dialogue — a feature that became a genre hallmark in Japan by the 2000s.' },
  { icon: GitBranch, title: 'Branching Choices', body: 'Presented as a menu at key moments, functioning much like a gamebook\'s choice points, but rendered as an on-screen dialogue option rather than a page-turn instruction.' },
  { icon: Users2, title: 'Route Structure', body: 'Many visual novels are organized into "routes" — a full path associated with a particular character or storyline — rather than a single tree of endings.' },
]

export default function VisualNovelsGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Visual Novel Guide',
    description: 'What a visual novel is, where the format came from, and the titles that defined the genre.',
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
      { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE_URL}/resources` },
      { '@type': 'ListItem', position: 3, name: 'The Visual Novel Guide', item: PAGE_URL },
    ],
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the difference between a kinetic novel and a visual novel?',
        acceptedAnswer: { '@type': 'Answer', text: 'A kinetic novel has no branching choices at all — it plays out as a single fixed story with visual novel presentation. A visual novel, in the stricter sense, includes reader choices that branch the narrative into different routes or endings.' },
      },
      {
        '@type': 'Question',
        name: 'Where did visual novels originate?',
        acceptedAnswer: { '@type': 'Answer', text: 'The format developed in Japan through the 1980s, with titles like Chunsoft\'s 1989 Otogirisou credited as an early, influential example that established the pairing of branching text with static character art, backgrounds, and music.' },
      },
    ],
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.3)' }}>
            <Film size={14} />
            Resources
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            The Visual Novel<br /><span className="text-amber-400">Guide</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Branching narrative dressed as a slideshow with a soundtrack — one of interactive fiction&apos;s most visually distinctive branches.
          </p>
        </div>
      </section>

      {/* ── Definition ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Definition</p>
          <h2 id="definition" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            What Is a Visual Novel?
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              A visual novel is a form of interactive fiction that presents branching narrative through a combination of static or lightly animated character art, background images, music, and text — closer in feel to a slideshow with dialogue than a simulated 3D world. The reader progresses through prose and dialogue, occasionally hitting a choice menu that determines which route the story follows next.
            </p>
            <p>
              Structurally, a visual novel is doing the same thing any branching gamebook or web-based interactive story does — presenting the reader with a fixed menu of choices that fork the narrative. What sets the format apart is entirely presentational: the visual and audio layer that surrounds the branching text. For the structural side of things, see <Link href="/guide/what-is-interactive-fiction" className="text-violet-700 underline underline-offset-2 font-medium">what interactive fiction is</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Anatomy ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Anatomy</p>
          <h2 id="anatomy" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            The Four Pieces That Define the Format
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ANATOMY.map(a => (
              <div key={a.title} className="rounded-2xl border border-violet-100 bg-white p-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-4">
                  <a.icon size={18} className="text-violet-600" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Origins ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Origins</p>
          <h2 id="origins" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            A Japanese Answer to the Same 1976 Idea
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Visual novels emerged in Japan through the 1980s as home computers and later consoles gained the graphical capability to pair branching text with imagery. Early titles experimented with murder-mystery and adventure structures — Chunsoft&apos;s 1983 <em>Portopia Serial Murder Case</em> is often cited as an important early influence — but it&apos;s Chunsoft&apos;s 1989 title <em>Otogirisou</em> that&apos;s widely credited with crystallizing the format many now recognize: branching narrative, static character portraits, background art, and mood music, marketed in Japan as a &ldquo;sound novel.&rdquo;
            </p>
            <p>
              Through the 1990s and 2000s, visual novels matured into a major native genre across Japanese PC and console platforms, developing distinct subgenres — dating sims and otome games built around pursuing specific characters&apos; routes, mystery-focused visual novels, and pure kinetic novels with no branching at all, told as a single fixed story. This period runs roughly parallel to the decline of commercial text adventures in the West, documented in our <Link href="/resources/text-adventure-history" className="text-amber-700 underline underline-offset-2 font-medium">text adventure history</Link> — two branches of the same 1976 idea evolving on opposite sides of the world with very little cross-pollination for two decades.
            </p>
          </div>
        </div>
      </section>

      {/* ── Global spread ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Going Global</p>
          <h2 id="global-spread" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            From Niche Import to Global Digital Storefronts
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              For most of the 1990s, visual novels were a specialty import for audiences outside Japan, often reaching English speakers only through fan translations. Digital distribution changed that — storefronts like Steam gave Western audiences direct access to both Japanese titles and a growing wave of English-language visual novels built with free tools like Ren&apos;Py, dramatically lowering the barrier for independent authors to work in the format.
            </p>
            <p>
              That same period saw mobile apps and Western interactive fiction platforms borrow visual novel conventions — character art, mood-setting soundtracks, dialogue-style choice menus — even outside anything marketed explicitly as a &ldquo;visual novel.&rdquo; StoryQuestor&apos;s scene illustrations and per-scene ambient sound sit in that same lineage: pairing branching prose with imagery and audio to set mood, the same instinct that shaped the format in Japan four decades ago.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Keep Reading"
            items={[
              { href: '/resources/interactive-fiction-history', title: 'The History of Interactive Fiction', description: 'How gamebooks, text adventures, and visual novels all trace back to the same core idea.', tag: 'Resources' },
              { href: '/resources/text-adventure-history', title: 'Text Adventure History', description: 'The Western parallel to the visual novel — parser fiction from Colossal Cave to Infocom.', tag: 'Resources' },
              { href: '/guide/interactive-fiction-genres', title: 'Interactive Fiction Genres', description: 'How romance and mystery — genres visual novels excel at — use branching structure differently.', tag: 'Guide' },
              { href: '/resources', title: 'All Resources', description: 'The full reference library — history, formats, and the people who built them.', tag: 'Resources' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Pair your story with art and sound</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor lets you generate scene illustrations and attach ambient sound to any scene — no external tools required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white hover:brightness-110 shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Pencil size={16} />
              Start writing free
            </Link>
            <Link href="/resources"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              More resources <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
