import type { Metadata } from 'next'
import Link from 'next/link'
import { Terminal, ArrowRight, Pencil } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/resources/text-adventure-history`

export const metadata: Metadata = {
  title: { absolute: 'Text Adventure History | StoryQuestor' },
  description: 'How Colossal Cave Adventure and Zork invented parser fiction, why Infocom became the genre\'s commercial peak, and why typing commands was once the whole genre.',
  keywords: ['text adventure history', 'Colossal Cave Adventure', 'Zork', 'Infocom', 'parser fiction', 'interactive fiction archive'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Text Adventure History',
    description: 'How Colossal Cave Adventure and Zork invented parser fiction, and why typing commands was once the whole genre.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Adventure History',
    description: 'How Colossal Cave Adventure and Zork invented parser fiction — the full history.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const TIMELINE = [
  { year: '1976', event: 'Will Crowther, a programmer and caver, writes Colossal Cave Adventure on a PDP-10 mainframe — a text-only simulation of the real Mammoth Cave system he had helped map, playable by typing simple two-word commands.' },
  { year: '1977', event: 'Don Woods, a Stanford grad student, discovers Crowther\'s program, gets permission to expand it, and adds fantasy elements and more puzzles. The expanded version spreads across the ARPANET to universities nationwide.' },
  { year: '1977', event: 'A group of MIT students and staff, inspired by Adventure, begin building their own, more ambitious text adventure on MIT\'s mainframe: Zork.' },
  { year: '1979', event: 'Members of the Zork team found Infocom, aiming to bring text adventures to the new market of home computers, where memory constraints made text — not graphics — the practical medium.' },
  { year: '1980', event: 'Infocom releases a commercial version of Zork, splitting the mainframe game into a trilogy to fit home computer storage. It becomes a bestseller and establishes Infocom as the genre\'s dominant studio.' },
  { year: '1981–1987', event: 'Infocom\'s golden era: Zork II and III, Enchanter, Planetfall, A Mind Forever Voyaging, and Trinity — games praised for prose and puzzle design that outshone what contemporary graphics hardware could depict. Infocom famously marketed its games as running on an "imagination" more powerful than any graphics chip.' },
  { year: '1984', event: 'Infocom publishes The Hitchhiker\'s Guide to the Galaxy, co-written with Douglas Adams — one of the best-known text adventures ever made, notorious for its unfair-but-beloved puzzles.' },
  { year: 'Late 1980s', event: 'Graphical adventure games from Sierra On-Line and LucasArts absorb the genre\'s puzzle-driven structure into point-and-click interfaces. Infocom is acquired by Activision in 1986 and shut down as a studio in 1989; commercial text adventures effectively end.' },
  { year: '1990s', event: 'A hobbyist community keeps the form alive outside commercial publishing — the Interactive Fiction Archive becomes a central repository, and authoring systems like Inform let anyone write parser games without Infocom\'s proprietary tools.' },
  { year: '1995–present', event: 'The annual Interactive Fiction Competition (IFComp), running continuously since 1995, becomes the genre\'s primary venue for new work — an unbroken thread connecting the mainframe era to today\'s hobbyist and literary IF community.' },
]

export default function TextAdventureHistoryPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Text Adventure History',
    description: 'How Colossal Cave Adventure and Zork invented parser fiction, and why typing commands was once the whole genre.',
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
      { '@type': 'ListItem', position: 3, name: 'Text Adventure History', item: PAGE_URL },
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
            <Terminal size={14} />
            Resources
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Text Adventure<br /><span className="text-amber-400">History</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            No graphics, no fixed choices — just a cursor, a cave, and whatever you could think to type. The genre that made a computer feel like a co-author.
          </p>
        </div>
      </section>

      {/* ── What makes it different ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">The Format</p>
          <h2 id="what-is-a-text-adventure" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            What Makes a Text Adventure Different
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              A gamebook offers the reader a fixed menu of choices — turn to page 42, or page 87. A text adventure, also called &ldquo;parser fiction,&rdquo; asks the reader to type whatever they want to try: <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">GO NORTH</code>, <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">TAKE LAMP</code>, <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">OPEN MAILBOX</code>. A program called the parser interprets the input and describes what happens next in text.
            </p>
            <p>
              This made the format feel more open-ended than any menu-based branching fiction, but introduced a new kind of friction: the game only understands the verbs and nouns its author anticipated. A large amount of classic text-adventure play involved guessing the exact phrasing the parser expected — a source of both the genre&apos;s most notorious frustrations and some of its cleverest puzzle design, since a well-built parser game rewarded careful reading and lateral thinking rather than reflexes.
            </p>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Timeline</p>
          <h2 id="timeline" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            From a Mainframe Cave to IFComp
          </h2>
          <div className="flex flex-col gap-0">
            {TIMELINE.map((entry, i) => (
              <div key={entry.year + i} className="flex gap-5">
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

      {/* ── Infocom deep dive ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Case Study</p>
          <h2 id="infocom" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Infocom: Prose as the Special Effect
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Infocom&apos;s marketing leaned directly into the format&apos;s apparent limitation: home computer graphics in the early 1980s were crude, but a reader&apos;s imagination had no such ceiling. Print ads showed a stark contrast between a blocky, low-res game screen and the vivid mental image a well-written passage could conjure — the tagline was that Infocom games ran on a &ldquo;richer, more powerful computer&rdquo; than any console: the human mind.
            </p>
            <p>
              It worked because the prose was genuinely good, not just a workaround. Titles like <em>A Mind Forever Voyaging</em> and <em>Trinity</em> are still cited today as some of the most literary interactive fiction ever produced — evidence that the format&apos;s constraints, taken seriously, could produce work that graphical adventure games of the same era couldn&apos;t match in ambition, even as they eventually out-competed text adventures commercially.
            </p>
          </div>
        </div>
      </section>

      {/* ── Legacy ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Legacy</p>
          <h2 id="legacy" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            A Hobbyist Genre That Never Actually Died
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              Unlike some formats that faded entirely, text adventures kept an unbroken thread from the mainframe era to today through a dedicated hobbyist and literary community. Free authoring tools like Inform let anyone write and publish parser games without needing Infocom&apos;s proprietary compiler, and the Interactive Fiction Competition has run every year since 1995, giving new work a consistent home.
            </p>
            <p>
              That community&apos;s central insight — that a text adventure is closer to literature with a command line than to a video game — is part of why interactive fiction as a category eventually absorbed forms far beyond the parser, including gamebooks, hypertext, and visual novels. Read the fuller picture in <Link href="/resources/interactive-fiction-history" className="text-amber-300 underline underline-offset-2">the history of interactive fiction</Link>.
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
              { href: '/resources/choose-your-own-adventure-history', title: 'Choose Your Own Adventure History', description: 'The gamebook side of the same 1976 origin story — 184 books, 250 million copies sold.', tag: 'Resources' },
              { href: '/guide/what-is-interactive-fiction', title: 'What Is Interactive Fiction?', description: 'A complete introduction to the medium and the major forms it takes today.', tag: 'Guide' },
              { href: '/resources', title: 'All Resources', description: 'The full reference library — history, formats, and the people who built them.', tag: 'Resources' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">You don&apos;t need a parser to branch a story today</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor gives you a free visual canvas to build branching stories — connect scenes with a drag, no typed commands required.
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
