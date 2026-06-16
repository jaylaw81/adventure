import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, BookOpen, Pencil } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import TimelineScroller from '@/components/cyoa/TimelineScroller'

const SITE_URL = 'https://www.storyquestor.com'
const AMZN_TAG = 'storyquestor-20'

function amzn(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMZN_TAG}`
}

export const metadata: Metadata = {
  title: {
    absolute: 'Choose Your Own Adventure — History, Books & Series Guide',
  },
  description:
    'Explore the complete history of the Choose Your Own Adventure book series — from Edward Packard\'s 1969 origin story through 184 classic Bantam titles and the Chooseco revival. Browse iconic books and find them on Amazon.',
  keywords: [
    'Choose Your Own Adventure', 'CYOA books', 'Edward Packard', 'R.A. Montgomery',
    'Bantam Books', 'Chooseco', 'interactive fiction books', 'branching story books',
    'choose your own adventure history', '1980s books',
  ],
  alternates: { canonical: `${SITE_URL}/choose-your-own-adventure` },
  openGraph: {
    title: 'Choose Your Own Adventure — History, Books & Series Guide',
    description:
      'The complete history of the Choose Your Own Adventure book series: 184 books, 250 million copies sold, and a generation of readers who shaped the endings themselves.',
    url: `${SITE_URL}/choose-your-own-adventure`,
    type: 'article',
    siteName: 'StoryQuestor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Choose Your Own Adventure — History, Books & Series Guide',
    description: '184 books. 250 million copies sold. The complete history of the Choose Your Own Adventure series — and where to find them today.',
  },
}

// ── Book data ─────────────────────────────────────────────────────────────────

interface Book {
  number: number
  title: string
  author: string
  year: number
  description: string
  search: string
  accent: string
  coverId: number
}

const BOOKS: Book[] = [
  {
    number: 1,
    title: 'The Cave of Time',
    author: 'Edward Packard',
    year: 1979,
    description: 'The book that launched the series. You stumble into a mysterious cave and find yourself able to travel through time — to ancient Rome, the Ice Age, or centuries into the future.',
    search: 'The Cave of Time Choose Your Own Adventure Chooseco Packard',
    accent: '#7c3aed',
    coverId: 4672785,
  },
  {
    number: 2,
    title: 'Journey Under the Sea',
    author: 'R.A. Montgomery',
    year: 1979,
    description: 'Descend into the ocean in a submarine to find the lost city of Atlantis. Will you discover treasure — or become trapped beneath the waves forever?',
    search: 'Journey Under the Sea Choose Your Own Adventure Chooseco Montgomery',
    accent: '#0e7490',
    coverId: 3062257,
  },
  {
    number: 3,
    title: 'By Balloon to the Sahara',
    author: 'D. Terman',
    year: 1979,
    description: 'A runaway hot-air balloon carries you over the Sahara Desert. Survival depends entirely on the choices you make when you land.',
    search: 'By Balloon to the Sahara Choose Your Own Adventure',
    accent: '#b45309',
    coverId: 4672812,
  },
  {
    number: 4,
    title: 'Space and Beyond',
    author: 'R.A. Montgomery',
    year: 1980,
    description: 'Blast off on a galaxy-spanning mission. An early entry that proved no setting — not even outer space — was off-limits for the series.',
    search: 'Space and Beyond Choose Your Own Adventure Chooseco',
    accent: '#1d4ed8',
    coverId: 3062258,
  },
  {
    number: 5,
    title: 'The Mystery of Chimney Rock',
    author: 'Edward Packard',
    year: 1980,
    description: 'Strange, unexplained things are happening at an old Vermont inn. A ghost story that terrified a generation of young readers long before horror fiction was mainstream for kids.',
    search: 'Mystery of Chimney Rock Choose Your Own Adventure',
    accent: '#4b1d1d',
    coverId: 6542695,
  },
  {
    number: 6,
    title: 'Your Code Name is Jonah',
    author: 'Edward Packard',
    year: 1979,
    description: 'You\'re a secret agent with one mission: decode whale songs that may contain classified military intelligence. A Cold War thriller unlike anything else in children\'s publishing.',
    search: 'Your Code Name is Jonah Choose Your Own Adventure Packard',
    accent: '#065f46',
    coverId: 8871689,
  },
  {
    number: 7,
    title: 'The Third Planet from Altair',
    author: 'Edward Packard',
    year: 1979,
    description: 'An alien signal leads you across the galaxy to a world where an intelligent species waits. First contact has never been riskier — or stranger.',
    search: 'Third Planet from Altair Choose Your Own Adventure',
    accent: '#312e81',
    coverId: 8870172,
  },
  {
    number: 8,
    title: 'Deadwood City',
    author: 'Edward Packard',
    year: 1978,
    description: 'You\'re a stranger riding into a lawless Wild West town. Outlaws, sheriffs, and frontier justice await — in dozens of possible directions.',
    search: 'Deadwood City Choose Your Own Adventure Packard',
    accent: '#92400e',
    coverId: 8087376,
  },
  {
    number: 9,
    title: 'Who Killed Harlowe Thrombey?',
    author: 'Edward Packard',
    year: 1981,
    description: 'A murder mystery where you play the detective. One of the first interactive whodunits written for young readers — every choice leads to a different suspect.',
    search: 'Who Killed Harlowe Thrombey Choose Your Own Adventure',
    accent: '#1e1b4b',
    coverId: 6633222,
  },
  {
    number: 10,
    title: 'The Lost Jewels of Nabooti',
    author: 'R.A. Montgomery',
    year: 1981,
    description: 'An archaeological expedition into Africa goes dangerously wrong. You must track down stolen ancient jewels across multiple countries — if you survive long enough.',
    search: 'Lost Jewels of Nabooti Choose Your Own Adventure Montgomery',
    accent: '#365314',
    coverId: 11673617,
  },
  {
    number: 12,
    title: 'Inside UFO 54-40',
    author: 'Edward Packard',
    year: 1982,
    description: 'Legend says the paradise planet Ultima can never be reached by making choices — only by accident. Generations of readers searched every page to find the secret ending. Did you?',
    search: 'Inside UFO 54-40 Choose Your Own Adventure Packard',
    accent: '#4338ca',
    coverId: 6979939,
  },
  {
    number: 13,
    title: 'The Abominable Snowman',
    author: 'R.A. Montgomery',
    year: 1982,
    description: 'Deep in the Himalayas, you set out to find the legendary Yeti. A classic that balances adventure and mystery at altitude — now available again from Chooseco.',
    search: 'Abominable Snowman Choose Your Own Adventure Montgomery Chooseco',
    accent: '#0f766e',
    coverId: 9720724,
  },
]

// ── Timeline ──────────────────────────────────────────────────────────────────

const TIMELINE = [
  { year: '1969', event: 'Edward Packard invents the "Adventures of You" concept while telling bedtime stories to his daughters, asking them what the hero should do next.' },
  { year: '1976', event: 'Vermont Crossroads Press publishes the first interactive story as Adventures of You on Sugarcane Island. R.A. Montgomery, an editor there, becomes Packard\'s key collaborator.' },
  { year: '1979', event: 'Bantam Books launches the Choose Your Own Adventure series with The Cave of Time as Book #1. The format is refined, the brand is born.' },
  { year: '1982', event: 'The series hits its stride — Inside UFO 54-40 becomes a phenomenon, selling over a million copies. The legendary "secret ending" sparks playground debates nationwide.' },
  { year: '1984', event: 'Choose Your Own Adventure reaches peak popularity. Four titles simultaneously appear on the New York Times bestseller list. Annual sales top 16 million copies.' },
  { year: '1989', event: 'Book #100 is published. At this point the series has sold over 100 million copies and been translated into dozens of languages.' },
  { year: '1998', event: 'Bantam ends the original series after 184 books and nearly two decades, citing competition from video games and changing reading habits.' },
  { year: '2003', event: 'R.A. Montgomery founds Chooseco LLC in Waitsfield, Vermont — the same state where the series was originally conceived — to revive the brand.' },
  { year: '2006', event: 'Chooseco begins republishing classic titles with new cover art, bringing the series back to a new generation of readers.' },
  { year: 'Today', event: 'Chooseco continues publishing classic and new Choose Your Own Adventure titles. The format has inspired interactive games, digital fiction, and tools like StoryQuestor.' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CYOAHistoryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Choose Your Own Adventure — History, Books & Series Guide',
    description: 'The complete history of the Choose Your Own Adventure book series, from its 1969 origin to the Chooseco revival.',
    url: `${SITE_URL}/choose-your-own-adventure`,
    image: OG_IMAGE,
    datePublished: '2026-06-14',
    dateModified: '2026-06-14',
    author: { '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'StoryQuestor',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/choose-your-own-adventure` },
    about: {
      '@type': 'BookSeries',
      name: 'Choose Your Own Adventure',
      numberOfVolumes: 184,
    },
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={schema} />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-6 pt-36 pb-20 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <BookOpen size={14} />
            The Original Series
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Choose Your Own<br />
            <span className="text-amber-400">Adventure</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            The book series that put readers in charge of the story — 184 books, 250 million copies sold, and a generation that never forgot the thrill of turning to page 47.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { num: '184', label: 'Original books' },
              { num: '250M+', label: 'Copies sold' },
              { num: '38', label: 'Languages' },
              { num: '1979', label: 'Series launched' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-amber-400">{num}</p>
                <p className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Origin Story ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Origin</p>
          <h2 id="origin" className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>
            A Bedtime Story That Changed Everything
          </h2>
          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              In 1969, Vermont author <strong className="text-gray-900">Edward Packard</strong> sat by his daughter&apos;s bedside struggling to invent a bedtime story. When he ran out of plot, he did something unusual — he asked her what she thought the main character should do next. Her enthusiastic answer sparked an idea that would reshape children&apos;s publishing for decades: what if the <em>reader</em> made those choices?
            </p>
            <p>
              Packard spent years developing the concept into a manuscript called &ldquo;Sugarcane Island.&rdquo; After many rejections, Vermont Crossroads Press published it in 1976 as <em>Adventures of You on Sugarcane Island</em> — the first published book in which the reader determined the ending. It caught the eye of <strong className="text-gray-900">R.A. Montgomery</strong>, an author and educator at the press who would become the series&apos; most prolific contributor.
            </p>
            <p>
              Together they brought the concept to Bantam Books, which launched the <strong className="text-gray-900">Choose Your Own Adventure</strong> series in 1979 with <em>The Cave of Time</em> as Book #1. What followed was publishing history.
            </p>
            <p>
              By 1984, four Choose Your Own Adventure titles were simultaneously on the New York Times bestseller list. At peak production, a single new title could ship 750,000 copies in its first week. Children competed on playgrounds to compare endings — the branching format drove re-reading like nothing else before it. By the time the original Bantam series ended in 1998, it had produced <strong className="text-gray-900">184 books</strong> and sold over <strong className="text-gray-900">250 million copies</strong> worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <TimelineScroller entries={TIMELINE} />

      {/* ── Featured Books ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">The Books</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-3">
            <h2 id="books" className="text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>
              Iconic Titles to Read (or Re-Read)
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            All links go to Amazon, where you can find both original editions and Chooseco reprints.
          </p>
          <p className="text-xs text-gray-400 mb-10">
            As an Amazon Associate, StoryQuestor earns a small commission from qualifying purchases at no extra cost to you.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {BOOKS.map(book => (
              <a
                key={book.number}
                href={amzn(book.search)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                aria-label={`Find ${book.title} on Amazon`}
                className="group flex flex-col rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
              >
                {/* Cover image */}
                <div
                  className="relative w-full aspect-[2/3] overflow-hidden flex items-center justify-center"
                  style={{ background: book.accent }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                {/* Info */}
                <div className="p-3 bg-white flex-1 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: book.accent }}>
                    #{book.number} · {book.year}
                  </span>
                  <h3 className="text-sm font-bold leading-snug" style={{ color: '#1e0a3c' }}>{book.title}</h3>
                  <p className="text-[11px] text-gray-400">{book.author}</p>
                  <p className="text-xs text-amber-600 font-medium mt-auto pt-2 flex items-center gap-1">
                    Find on Amazon <ExternalLink size={10} />
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Browse all CTA */}
          <div className="mt-10 text-center">
            <a
              href={amzn('Choose Your Own Adventure Chooseco books')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              Browse the full series on Amazon
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── The Authors ── */}
      <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">The Creators</p>
          <h2 id="authors" className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>
            Edward Packard & R.A. Montgomery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-violet-100 p-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                <span className="text-white font-extrabold text-lg">EP</span>
              </div>
              <h3 className="text-xl font-extrabold mb-1" style={{ color: '#1e0a3c' }}>Edward Packard</h3>
              <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide mb-4">Creator of the format</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                A Vermont-based author and attorney, Packard invented the &ldquo;Adventures of You&rdquo; format in 1969 for his daughters. He wrote dozens of books in the series including <em>The Cave of Time</em>, <em>Inside UFO 54-40</em>, and <em>You Are a Shark</em>. His instinct — that readers are more engaged when they participate — predated the internet by decades and anticipated the logic of every modern video game and interactive app.
              </p>
              <a
                href={amzn('Edward Packard Choose Your Own Adventure books')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                Browse Packard&apos;s books on Amazon <ExternalLink size={12} />
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                <span className="text-gray-900 font-extrabold text-lg">RM</span>
              </div>
              <h3 className="text-xl font-extrabold mb-1" style={{ color: '#1e0a3c' }}>R.A. Montgomery</h3>
              <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-4">Author & series champion</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ray Montgomery was the series&apos; most prolific author and its greatest institutional champion. As an editor at Vermont Crossroads Press, he first encountered Packard&apos;s concept and helped bring it to Bantam. He went on to write dozens of titles — <em>Journey Under the Sea</em>, <em>Space and Beyond</em>, <em>The Abominable Snowman</em> — and in 2003, he founded <strong className="text-gray-800">Chooseco LLC</strong> to revive the series after Bantam ended it, ensuring the format would survive for another generation.
              </p>
              <a
                href={amzn('R.A. Montgomery Choose Your Own Adventure books Chooseco')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors"
              >
                Browse Montgomery&apos;s books on Amazon <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Legacy ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Legacy</p>
          <h2 id="legacy" className="text-3xl font-extrabold text-white mb-6">
            The Idea That Didn&apos;t End in 1998
          </h2>
          <div className="text-gray-400 leading-relaxed space-y-5 text-base">
            <p>
              The Choose Your Own Adventure series demonstrated something that no amount of traditional publishing had proven before: readers don&apos;t just want to be told stories — they want to <em className="text-gray-200">participate</em> in them. That instinct turned out to be foundational. It runs through the design of role-playing video games, hypertext fiction, interactive films, escape rooms, and the entire genre of &ldquo;choice-based narratives.&rdquo;
            </p>
            <p>
              Today the format is more alive than ever. Chooseco continues publishing classic titles. Digital platforms let anyone build branching stories without writing a line of code. What was once a specialty children&apos;s format is now a universal medium.
            </p>
            <p className="text-gray-300">
              StoryQuestor was built on this same conviction — that the best stories are ones where you have a say in what happens next. If the series inspired you as a kid, you already understand what we&apos;re building.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 bg-amber-400 hover:bg-amber-500 transition-colors"
            >
              <Pencil size={14} />
              Write your own adventure — free
            </Link>
            <Link
              href="/explore"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors"
            >
              <BookOpen size={14} />
              Play community stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
