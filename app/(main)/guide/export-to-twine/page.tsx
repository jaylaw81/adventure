import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Pencil, ArrowRight, FileText, Link2, Tag, Image as ImageIcon, Map as MapIcon } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

const SITE_URL = 'https://www.storyquestor.com'
const PAGE_URL = `${SITE_URL}/guide/export-to-twine`

export const metadata: Metadata = {
  title: { absolute: 'How to Export Your Story to Twine | StoryQuestor' },
  description: 'Download a StoryQuestor story as a Twine 2 file, import it into Twine with Library → Import, and see exactly what carries over.',
  keywords: ['export to twine', 'twine 2 import', 'twine story file', 'harlowe', 'interactive fiction export'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'How to Export Your Story to Twine',
    description: 'Download a StoryQuestor story as a Twine 2 file and open it in Twine.',
    url: PAGE_URL,
    type: 'article',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Export Your Story to Twine',
    description: 'Download a StoryQuestor story as a Twine 2 file and open it in Twine.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
}

const STEPS = [
  { title: 'Open your story in the editor', body: 'From your dashboard, open the story you want to export.' },
  { title: 'Open Story Settings', body: 'Click Settings in the editor toolbar.' },
  { title: 'Download the Twine file', body: 'Under "Export to Twine", click Download Twine file. You\'ll get a single .html file named after your story.' },
  { title: 'Import it into Twine', body: 'In Twine 2 (desktop or twinery.org), choose Library → Import, pick the downloaded file, and your story appears in your library.' },
]

const CARRIES_OVER = [
  { icon: FileText, title: 'Scenes become passages', body: 'Each scene\'s title becomes the passage name and its text becomes the passage body. Your start scene is set as Twine\'s starting passage.' },
  { icon: Link2, title: 'Choices become links', body: 'Every choice is written as a Harlowe link to the scene it leads to, in the same order readers see them. Chapter endings link on to the next chapter.' },
  { icon: Tag, title: 'Chapters become tags', body: 'Scenes inside a chapter are tagged with the chapter name, so you can filter and highlight them in Twine.' },
  { icon: ImageIcon, title: 'Scene images come along', body: 'Scene images are included as image links pointing at their StoryQuestor URLs. They\'re linked, not embedded, so they need an internet connection to show.' },
  { icon: MapIcon, title: 'Your map layout is kept', body: 'Node Graph stories keep their canvas arrangement in Twine\'s story map. Block Builder and Storybook stories are laid out in a tidy grid.' },
]

export default function ExportToTwinePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Export Your Story to Twine',
    description: 'Download a StoryQuestor story as a Twine 2 file, import it into Twine, and see exactly what carries over.',
    url: PAGE_URL,
    datePublished: '2026-10-30',
    dateModified: '2026-10-30',
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
      { '@type': 'ListItem', position: 3, name: 'How to Export Your Story to Twine', item: PAGE_URL },
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
            <Download size={14} />
            Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            How to Export Your Story<br /><span className="text-amber-400">to Twine</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Take any story you&apos;ve written on StoryQuestor into Twine 2, the open-source tool for interactive fiction, in a few clicks.
          </p>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Why Export</p>
          <h2 id="why-export" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            Your Story, in a Format You Can Take Anywhere
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              Twine is one of the most widely used tools for interactive fiction, and its files are a common format for branching stories. Exporting gives you a copy of your story you can keep, edit in Twine, add Twine-specific code to, or publish on sites that accept Twine games, such as itch.io.
            </p>
            <p>
              Exporting doesn&apos;t change anything on StoryQuestor. Your story stays exactly where it is, and you can export again whenever you make changes.
            </p>
            <p>
              Twine export is included with the Weekly and Monthly plans. <Link href="/pricing" className="text-amber-700 underline underline-offset-2 font-medium">See plans</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Step by Step</p>
          <h2 id="how-to-export" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            Exporting and Importing
          </h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-2xl border border-violet-100 bg-white p-6">
                <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0 text-sm font-bold text-violet-700">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1" style={{ color: '#1e0a3c' }}>{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What carries over ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">What Carries Over</p>
          <h2 id="what-carries-over" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            How Your Story Maps to Twine
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CARRIES_OVER.map(c => (
              <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4">
                  <c.icon size={18} className="text-amber-600" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Limits ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Good to Know</p>
          <h2 id="not-included" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            What Isn&apos;t Included
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5">
            <p>
              The export covers your story&apos;s text and structure. World Builder features such as character stats, choice effects and conditions, items, foes and combat aren&apos;t included, and neither are scene soundscapes. In Twine, choices that depended on a condition show up as ordinary links.
            </p>
            <p>
              Passages use Harlowe, Twine&apos;s default story format. If two scenes share a title, the second gets a number added, like &ldquo;The Cave (2)&rdquo;, because Twine needs every passage name to be unique. Brackets and arrows in titles are swapped for similar characters so they don&apos;t break Twine&apos;s link syntax.
            </p>
            <p>
              Storybook stories export as a run of pages, each with a &ldquo;Next page&rdquo; link to the next.
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
              { href: '/guide/what-is-interactive-fiction', title: 'What Is Interactive Fiction?', description: 'An introduction to the medium, including where Twine fits in.', tag: 'Guide' },
              { href: '/guide/branching-story-structure', title: 'Branching Story Structure Explained', description: 'The structural patterns almost every branching story is built from.', tag: 'Guide' },
              { href: '/guide/how-to-write-branching-stories', title: 'How to Write Branching Stories', description: 'A step-by-step approach to planning and drafting a branching story.', tag: 'Guide' },
              { href: '/resources/interactive-fiction-history', title: 'Interactive Fiction History', description: 'From text adventures to Twine and beyond.', tag: 'Resources' },
            ]}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Write it visually, take it anywhere</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            Build your branching story on StoryQuestor&apos;s canvas, then export it to Twine whenever you like.
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
