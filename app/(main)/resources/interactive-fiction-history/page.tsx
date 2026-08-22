import type { Metadata } from 'next'
import Link from 'next/link'
import { Library, Terminal, MessageSquareText, Film, Sparkles, ArrowRight, ExternalLink } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/resources/interactive-fiction-history`
const AMZN_TAG = 'storyquestor-20'

function amzn(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMZN_TAG}`
}

export const metadata: Metadata = {
  title: { absolute: 'The History of Interactive Fiction | StoryQuestor' },
  description: 'From 1970s gamebooks and mainframe text adventures to hypertext fiction, visual novels, and modern branching apps — the full history of interactive fiction.',
  keywords: [
    'interactive fiction history', 'text adventure history', 'gamebook history',
    'hypertext fiction', 'visual novel history', 'Zork', 'Colossal Cave Adventure',
    'Twine', 'branching narrative history',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'The History of Interactive Fiction',
    description: 'From 1970s gamebooks and mainframe text adventures to hypertext fiction, visual novels, and modern branching apps.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The History of Interactive Fiction',
    description: 'From 1970s gamebooks and mainframe text adventures to hypertext fiction, visual novels, and modern branching apps.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const TIMELINE = [
  { year: '1976', event: 'Two branching-narrative forms emerge independently: Will Crowther writes Colossal Cave Adventure, the first parser-based text adventure, while Vermont Crossroads Press publishes Edward Packard\'s Adventures of You on Sugarcane Island, the first gamebook.' },
  { year: '1977', event: 'Colossal Cave Adventure spreads across the ARPANET and university mainframes, inspiring a generation of programmers to write their own text adventures.' },
  { year: '1979', event: 'Bantam Books launches Choose Your Own Adventure, turning the gamebook into a publishing phenomenon. Infocom is founded by MIT researchers who worked on Zork.' },
  { year: '1980s', event: 'Text adventures reach commercial peak with Infocom titles like Zork and The Hitchhiker\'s Guide to the Galaxy. In the UK, Steve Jackson and Ian Livingstone launch the Fighting Fantasy gamebook series, adding dice-based combat to branching narrative.' },
  { year: 'Late 1980s', event: 'Graphical adventure games (Sierra, LucasArts) begin absorbing the text adventure\'s puzzle-driven structure into point-and-click interfaces, and commercial text adventures decline.' },
  { year: '1989', event: 'Chunsoft releases Otogirisou in Japan, an early and influential visual novel that pairs branching narrative with static character art and sound.' },
  { year: '1990s', event: 'The visual novel format matures in Japan across PC and console platforms, becoming a dominant form of interactive storytelling there while the West largely moves toward graphical adventure and RPG genres.' },
  { year: '1995', event: 'The Interactive Fiction Archive and early web tools keep parser-based text adventures alive as a hobbyist community, independent of commercial publishing.' },
  { year: '2009', event: 'Chris Klimas releases Twine, a free tool for writing hypertext fiction with simple links instead of a parser or numbered passages — dramatically lowering the barrier to writing interactive fiction.' },
  { year: '2010s', event: 'Mobile apps and web platforms bring branching fiction to mainstream audiences again, often blending gamebook-style choices with visual novel presentation and light RPG mechanics.' },
  { year: 'Today', event: 'Interactive fiction spans printed gamebooks, hobbyist parser games, visual novels, and browser/app-based platforms like StoryQuestor — all built on the same core idea Edward Packard and Will Crowther arrived at independently in 1976.' },
]

export default function InteractiveFictionHistoryPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The History of Interactive Fiction',
    description: 'From 1970s gamebooks and mainframe text adventures to hypertext fiction, visual novels, and modern branching apps.',
    url: PAGE_URL,
    datePublished: '2026-08-22',
    dateModified: '2026-08-22',
    author: { '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL },
    publisher: {
      '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE_URL}/resources` },
      { '@type': 'ListItem', position: 3, name: 'The History of Interactive Fiction', item: PAGE_URL },
    ],
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.3)' }}>
            <Library size={14} />
            Resources
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            The History of<br /><span className="text-amber-400">Interactive Fiction</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            One idea, invented twice in the same year, that grew into gamebooks, text adventures, visual novels, and everything readers now call &ldquo;choice-based&rdquo; storytelling.
          </p>
        </div>
      </section>

      {/* ── Origin ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Origin</p>
          <h2 id="origin" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Two Inventors, One Idea, 1976
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Interactive fiction has an unusually clean origin story: in 1976, two people who had never met each other independently arrived at the same idea. In Vermont, author <strong className="text-gray-900">Edward Packard</strong> published <em>Adventures of You on Sugarcane Island</em> — a book where the reader chose what happened next by turning to a specific page. That book eventually became the first title in what Bantam Books would launch in 1979 as <Link href="/resources/choose-your-own-adventure-history" className="text-violet-700 underline underline-offset-2">Choose Your Own Adventure</Link>.
            </p>
            <p>
              At almost the same moment, a caver and programmer named <strong className="text-gray-900">Will Crowther</strong> wrote <em>Colossal Cave Adventure</em> on a mainframe computer — a program that described a cave system in text and let the player type commands like <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">GO NORTH</code> or <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">TAKE LAMP</code> to explore it. It spread across the early ARPANET, and within a few years inspired a wave of &ldquo;text adventures&rdquo; from hobbyists and, later, professional studios.
            </p>
            <p>
              Neither Packard nor Crowther used the phrase &ldquo;interactive fiction&rdquo; — that term came later, popularized by IF communities in the 1980s and 90s. But both had discovered the same structural insight from opposite directions: a story with a reader who makes decisions is more compelling than a story with only a narrator.
            </p>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Timeline</p>
          <h2 id="timeline" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            Fifty Years of Branching Stories
          </h2>
          <div className="flex flex-col gap-0">
            {TIMELINE.map((entry, i) => (
              <div key={entry.year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-violet-200 my-1" />}
                </div>
                <div className="pb-8">
                  <p className="text-sm font-bold text-violet-700 mb-1">{entry.year}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{entry.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Text Adventures deep-ish dive ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Terminal size={18} className="text-blue-600" />
            </div>
            <h2 id="text-adventures" className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>
              Text Adventures: Interactive Fiction Without a Fixed Menu
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Where a gamebook offers a fixed list of choices, text adventures — also called &ldquo;parser fiction&rdquo; — ask the reader to type whatever they want to try. This made the form feel more open-ended, but also introduced a new problem: the game only understands the specific verbs and nouns its author anticipated, so a frustrating amount of early text-adventure play involved guessing the right phrasing.
            </p>
            <p>
              <strong className="text-gray-900">Infocom</strong>, founded in 1979 by a group that included several Zork co-creators, became the genre&apos;s commercial high point through the 1980s, known for witty prose and clever puzzle design that outshone what contemporary graphics hardware could depict. When graphical adventure games from studios like Sierra and LucasArts arrived in the late 1980s, commercial text adventures faded — but the form never disappeared. A dedicated hobbyist community kept writing and archiving parser games through the 1990s and beyond, and it remains active today as a niche but enduring craft.
            </p>
            <p>
              We cover this branch of the family tree in more depth in our dedicated <Link href="/resources/text-adventure-history" className="text-gray-900 font-semibold underline underline-offset-2">text adventure history</Link> guide.
            </p>
          </div>
        </div>
      </section>

      {/* ── Hypertext & Visual Novels ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <MessageSquareText size={18} className="text-amber-400" />
              </div>
              <h2 id="hypertext" className="text-xl font-extrabold text-white">Hypertext Fiction &amp; Twine</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              By the 2000s, the web made it trivial to link one page of text to another, and a new wave of authors began writing branching stories as simple hyperlinked pages rather than parser commands or numbered passages. The 2009 release of <strong className="text-white">Twine</strong>, a free open-source tool, turned this into a genuine movement — anyone could write and publish a branching story without programming knowledge, and thousands did. Twine remains foundational to how independent interactive fiction is taught and made today.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Film size={18} className="text-rose-400" />
              </div>
              <h2 id="visual-novels" className="text-xl font-extrabold text-white">Visual Novels</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              In Japan, branching narrative took a distinct visual path. Titles like Chunsoft&apos;s 1989 <em>Otogirisou</em> paired branching text with character portraits, backgrounds, and music — a presentation style that became known as the visual novel. The format matured into a major native genre through the 1990s and 2000s and later found a global audience through digital distribution. It remains one of the most visually distinctive branches of interactive fiction — read the full history in our <Link href="/resources/visual-novels-guide" className="text-white underline underline-offset-2">visual novel guide</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Modern era ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center">
              <Sparkles size={18} className="text-teal-600" />
            </div>
            <h2 id="modern-era" className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>
              The Modern Era: Apps, Platforms, and Everyone as an Author
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              The last decade has narrowed the gap between reading and writing interactive fiction. Mobile apps brought choice-based stories back to mass audiences, often blending gamebook-style choices with visual novel presentation. Web platforms went further, adding visual canvases where authors connect scenes with a drag instead of writing numbered passages or hyperlink code — closer in spirit to how a screenwriter storyboards a script than how a programmer writes software.
            </p>
            <p>
              StoryQuestor sits in this newest branch of the tree: a node-based canvas for building branching stories, with optional RPG-style character stats and combat for authors who want their interactive fiction to lean toward game mechanics. If you want to see how the pieces work together, our <Link href="/how-to" className="text-teal-700 underline underline-offset-2">product guide</Link> walks through building a story from scratch, and our <Link href="/guide/what-is-interactive-fiction" className="text-teal-700 underline underline-offset-2">writing guide</Link> covers the craft of branching narrative independent of any particular tool.
            </p>
          </div>
        </div>
      </section>

      {/* ── Further reading ── */}
      <section className="px-6 py-16" style={{ background: '#faf5ff' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-3">Want to go deeper on the book series that made gamebooks mainstream?</p>
          <a
            href={amzn('Choose Your Own Adventure Chooseco books')}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-violet-300 text-violet-700 bg-white hover:bg-violet-50 transition-colors"
          >
            Browse Choose Your Own Adventure books on Amazon
            <ExternalLink size={13} />
          </a>
          <p className="text-[11px] text-gray-400 mt-3">
            As an Amazon Associate, StoryQuestor earns a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Keep Reading"
            items={[
              {
                href: '/resources/choose-your-own-adventure-history',
                title: 'Choose Your Own Adventure — History, Books & Series Guide',
                description: 'The deep dive into the gamebook series that started it all — 184 books, 250 million copies sold.',
                tag: 'Resources',
              },
              {
                href: '/resources/text-adventure-history',
                title: 'Text Adventure History',
                description: 'How Colossal Cave Adventure and Zork invented parser fiction, and why Infocom became its commercial peak.',
                tag: 'Resources',
              },
              {
                href: '/resources/visual-novels-guide',
                title: 'The Visual Novel Guide',
                description: 'What a visual novel is, where the format came from, and the titles that defined it.',
                tag: 'Resources',
              },
              {
                href: '/guide/what-is-interactive-fiction',
                title: 'What Is Interactive Fiction?',
                description: 'A complete introduction to the medium and how branching narrative actually works.',
                tag: 'Guide',
              },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Write the next chapter of this history.</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor gives you a free visual canvas to build branching stories — no code required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white hover:brightness-110 shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
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
