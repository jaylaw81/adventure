import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, GitBranch, Terminal, Film, MessageSquareText, Sparkles, ArrowRight, Pencil } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/what-is-interactive-fiction`

export const metadata: Metadata = {
  title: { absolute: 'What Is Interactive Fiction? A Complete Guide | StoryQuestor' },
  description: 'What interactive fiction is, how it differs from novels and video games, and the major forms it takes — from gamebooks to text adventures to modern branching apps.',
  keywords: [
    'interactive fiction', 'what is interactive fiction', 'branching stories',
    'choose your own adventure', 'text adventure', 'gamebook', 'visual novel',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'What Is Interactive Fiction? A Complete Guide',
    description: 'A complete introduction to interactive fiction — what it is, how it works, and the major forms it takes.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Is Interactive Fiction? A Complete Guide',
    description: 'What interactive fiction is, how it differs from novels and video games, and the major forms it takes.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const FORMS = [
  {
    icon: BookOpen,
    name: 'Gamebooks',
    era: '1970s–present',
    body: 'Printed books where each numbered passage ends in a choice — "turn to page 42 if you open the door, page 87 if you flee." Choose Your Own Adventure and Fighting Fantasy popularized the format for a mass audience.',
    color: 'amber',
  },
  {
    icon: Terminal,
    name: 'Text Adventures',
    era: '1976–present',
    body: 'Also called "parser fiction" — the reader types free-form commands like GO NORTH or TAKE LAMP instead of choosing from a fixed list. Colossal Cave Adventure and Zork defined the genre.',
    color: 'violet',
  },
  {
    icon: MessageSquareText,
    name: 'Hypertext Fiction',
    era: '1980s–present',
    body: 'Digital-native branching stories built from linked passages, often with no combat or puzzles — just narrative. Tools like Twine made this form widely accessible to independent authors.',
    color: 'blue',
  },
  {
    icon: Film,
    name: 'Visual Novels',
    era: '1980s–present',
    body: 'A Japan-popularized style that pairs branching narrative with character art, backgrounds, and voice acting, presented like a slideshow with dialogue choices rather than a simulated 3D world.',
    color: 'rose',
  },
  {
    icon: Sparkles,
    name: 'Modern Web & App Fiction',
    era: '2010s–present',
    body: 'Mobile and browser-based platforms that pair branching text with generated artwork, character stats, and sharable links — built for readers who grew up with apps, not paperbacks.',
    color: 'teal',
  },
]

const COLOR_MAP: Record<string, { ring: string; icon: string; text: string }> = {
  amber:  { ring: 'border-amber-200 bg-amber-50',  icon: 'text-amber-600',  text: 'text-amber-700' },
  violet: { ring: 'border-violet-200 bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700' },
  blue:   { ring: 'border-blue-200 bg-blue-50',    icon: 'text-blue-600',   text: 'text-blue-700' },
  rose:   { ring: 'border-rose-200 bg-rose-50',    icon: 'text-rose-600',   text: 'text-rose-700' },
  teal:   { ring: 'border-teal-200 bg-teal-50',    icon: 'text-teal-600',   text: 'text-teal-700' },
}

export default function WhatIsInteractiveFictionPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What Is Interactive Fiction? A Complete Guide',
    description: 'What interactive fiction is, how it differs from novels and video games, and the major forms it takes.',
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is interactive fiction the same as a video game?',
        acceptedAnswer: { '@type': 'Answer', text: 'Not exactly. Interactive fiction is defined by branching narrative and reader choice rather than reflexes, graphics, or simulation. Many interactive fiction works have no graphics at all, while many video games use interactive fiction techniques (like dialogue trees) within a larger game.' },
      },
      {
        '@type': 'Question',
        name: 'What was the first interactive fiction?',
        acceptedAnswer: { '@type': 'Answer', text: 'Two forms emerged independently in the 1970s: Edward Packard\'s gamebook manuscripts (published in 1976, later becoming Choose Your Own Adventure) and Will Crowther\'s Colossal Cave Adventure (1976), the first parser-based text adventure.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need to know how to code to write interactive fiction?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. Visual tools like StoryQuestor let authors build branching stories on a node canvas — connecting scenes with choices by dragging a line — without writing any code.' },
      },
    ],
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-16 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <BookOpen size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            What Is<br /><span className="text-amber-400">Interactive Fiction?</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            A story you don&apos;t just read — one you steer. Here&apos;s what that actually means, and the many forms it has taken over the last fifty years.
          </p>
        </div>
      </section>

      {/* ── Definition ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Definition</p>
          <h2 id="definition" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            A Story Where the Reader Makes Decisions
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              <strong className="text-gray-900">Interactive fiction</strong> is a category of storytelling in which the reader periodically makes decisions that determine what happens next — and, usually, how the story ends. Instead of a single fixed sequence of events, the author writes a network of possible scenes connected by choices, and each reader experiences one specific path through that network.
            </p>
            <p>
              That&apos;s the whole concept, but the range of things built on top of it is enormous. Interactive fiction can be a printed book where you flip to a numbered page, a text adventure where you type commands into a terminal, an illustrated visual novel with voiced dialogue, or a browser-based story with character stats and combat. What ties all of them together isn&apos;t the medium — it&apos;s the structure: <em>branching narrative shaped by reader choice.</em>
            </p>
            <p>
              This is different from simply being told a story is &ldquo;interactive&rdquo; because you can turn pages or click next. In interactive fiction, your choices have to actually branch the narrative — different choices lead to meaningfully different scenes, and often different endings. If you want the craft behind writing those choices well, see <Link href="/guide/how-to-create-meaningful-choices" className="text-amber-700 underline underline-offset-2">how to create meaningful choices</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Not a video game ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">A Common Confusion</p>
          <h2 id="not-a-video-game" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Interactive Fiction vs. Video Games
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Video games and interactive fiction overlap but aren&apos;t the same thing. A video game is generally defined by simulation and reflexes — you control a character in real time, aim, jump, or react. Interactive fiction is generally defined by <em>narrative branching</em> — you read, then choose, then read again. There&apos;s no timer, no aiming, no failure state you need quick reflexes to avoid.
            </p>
            <p>
              In practice the line blurs constantly. Many video games — RPGs especially — contain long interactive fiction sequences: dialogue trees, moral choices, branching questlines. And many modern interactive fiction platforms borrow game-like elements such as character stats, inventories, and combat encounters to add stakes to the reading experience. StoryQuestor&apos;s <Link href="/how-to#world-builder" className="text-violet-700 underline underline-offset-2">World Builder mode</Link> is a good example — it layers RPG-style party stats and foe encounters on top of a branching narrative core.
            </p>
            <p>
              The useful distinction isn&apos;t &ldquo;is this a game or a book&rdquo; — it&apos;s whether the core loop is <strong className="text-gray-900">read → decide → read</strong>. If it is, you&apos;re looking at interactive fiction, whatever it&apos;s wrapped in.
            </p>
          </div>
        </div>
      </section>

      {/* ── Forms ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Five Major Forms</p>
          <h2 id="forms" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            The Shapes Interactive Fiction Has Taken
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FORMS.map(form => {
              const c = COLOR_MAP[form.color]
              return (
                <div key={form.name} className={`rounded-2xl border p-6 ${c.ring}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <form.icon size={20} className={c.icon} />
                    <h3 className="text-base font-bold" style={{ color: '#1e0a3c' }}>{form.name}</h3>
                    <span className={`ml-auto text-[11px] font-semibold ${c.text}`}>{form.era}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{form.body}</p>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-500 mt-8 leading-relaxed">
            Want the full story behind each of these? Read the deep dive on <Link href="/resources/interactive-fiction-history" className="text-amber-700 underline underline-offset-2 font-medium">the history of interactive fiction</Link>, or go straight to the book series that started it all in our <Link href="/resources/choose-your-own-adventure-history" className="text-amber-700 underline underline-offset-2 font-medium">Choose Your Own Adventure history</Link>.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <GitBranch size={18} className="text-amber-400" />
            </div>
            <h2 id="how-it-works" className="text-2xl sm:text-3xl font-extrabold text-white">How Branching Actually Works</h2>
          </div>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              Under the hood, almost every piece of interactive fiction is a graph: scenes are nodes, and choices are the connections between them. A reader starts at one node and, at each decision point, follows one of the outgoing connections to the next.
            </p>
            <p>
              Authors rarely write a fully unrestricted tree, because the number of scenes needed grows exponentially with every added choice. Instead, most branching stories use a handful of recurring structural patterns — paths that diverge and later reconverge, hub-and-spoke chapters, or a small number of distinct endings that many different paths can lead to. We cover these patterns in detail in <Link href="/guide/branching-story-structure" className="text-amber-300 underline underline-offset-2">branching story structure explained</Link>.
            </p>
            <p>
              What matters to the reader isn&apos;t the underlying graph — it&apos;s that each choice feels like it belongs to them. That&apos;s a writing skill, not a technical one, and it&apos;s the single biggest differentiator between interactive fiction that hooks readers and interactive fiction that feels like a maze.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why people love it ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Why It Endures</p>
          <h2 id="why-people-love-it" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Why Readers Keep Coming Back
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Interactive fiction produces a kind of ownership that linear stories can&apos;t. When you choose to open the door instead of running away, and the story punishes or rewards that choice, the outcome feels like it happened <em>to you</em> — not to a character you&apos;re passively observing.
            </p>
            <p>
              That ownership is also what drives replayability. A novel is usually read once. A well-built piece of interactive fiction invites a second, third, or tenth reading, because there are paths and endings the reader hasn&apos;t seen yet. This is precisely why the Choose Your Own Adventure series became a playground phenomenon in the 1980s — kids compared endings the way they compared high scores.
            </p>
            <p>
              It has also proven to be an unusually good teaching format. Branching scenarios are widely used in classrooms to teach decision-making, history, and ethics, because letting a student make a choice and see its consequence sticks better than simply telling them the consequence.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <RelatedReading
            heading="Continue Learning"
            items={[
              {
                href: '/guide/how-to-write-branching-stories',
                title: 'How to Write Branching Stories',
                description: 'A step-by-step approach to planning and drafting a branching story from premise to first draft.',
                tag: 'Guide',
              },
              {
                href: '/guide/branching-story-structure',
                title: 'Branching Story Structure Explained',
                description: 'Diamonds, hubs, gauntlets, and time caves — the structural patterns branching stories are built from.',
                tag: 'Guide',
              },
              {
                href: '/resources/interactive-fiction-history',
                title: 'The History of Interactive Fiction',
                description: 'From 1970s gamebooks and mainframe text adventures to modern branching apps — the full timeline.',
                tag: 'Resources',
              },
              {
                href: '/how-to',
                title: 'How to Use StoryQuestor',
                description: 'A hands-on walkthrough of building your first branching story on the StoryQuestor canvas.',
                tag: 'Product Guide',
              },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Ready to write your own?</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            StoryQuestor gives you a free visual canvas to build branching stories — connect scenes with a drag, no code required.
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
