import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Play, ArrowLeft, Pencil, Star, Flame, Sparkles } from 'lucide-react'
import { getAllPublicTags, getPublicAdventuresByTag } from '@/lib/queries'
import { tagToSlug } from '@/lib/tags'
import { getTagIntro, getTagFaq } from '@/lib/tagContent'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://www.storyquestor.com'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults Only',
}

// Below this many total stories, curated Featured/Popular/New sections would mostly
// overlap or sit empty — show one plain grid instead.
const CURATION_THRESHOLD = 6

interface Props {
  params: Promise<{ tag: string }>
}

type TagStory = Awaited<ReturnType<typeof getPublicAdventuresByTag>>[number]

/** Several raw tag spellings can share a slug (e.g. "Adventure" and "adventure") — prefer the Title Case one for display. */
function pickDisplayLabel(variants: string[]): string {
  return variants.find(v => /^[A-Z]/.test(v)) ?? variants[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: slug } = await params
  const allTags = await getAllPublicTags()
  const variants = allTags.filter(t => tagToSlug(t) === slug)
  if (variants.length === 0) return { title: 'Category Not Found' }
  const label = pickDisplayLabel(variants)

  const title = `${label} Interactive Stories — StoryQuestor`
  const description = getTagIntro(label)
  return {
    title: { absolute: title },
    description,
    keywords: ['interactive story', 'choose your own adventure', label.toLowerCase(), `${label.toLowerCase()} stories`],
    alternates: { canonical: `${SITE_URL}/explore/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/explore/${slug}`,
      images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
    },
  }
}

function StoryCard({ story, currentSlug }: { story: TagStory; currentSlug: string }) {
  const tags: string[] = (() => { try { return JSON.parse(story.tags ?? '[]') } catch { return [] } })()
  const playUrl = story.storySlug ? `/story/${story.storySlug}` : `/play/${story.id}`

  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col border border-violet-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden">
      {story.coverImageUrl ? (
        <div className="w-full h-36 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.coverImageUrl} alt={story.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
      )}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold" style={{ color: '#1e0a3c' }}>{story.title}</h3>
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap">
            {AUDIENCE_LABEL[story.audience] ?? story.audience}
          </span>
        </div>
        {story.avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-sm leading-none">
              {'★'.repeat(Math.round(story.avgRating))}{'☆'.repeat(5 - Math.round(story.avgRating))}
            </span>
            <span className="text-xs text-gray-500">{story.avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({story.reviewCount})</span>
          </div>
        )}
        {story.description && (
          <p className="text-gray-500 text-sm line-clamp-3">{story.description}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(t => (
              <Link
                key={t}
                href={`/explore/${tagToSlug(t)}`}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  tagToSlug(t) === currentSlug
                    ? 'text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
                style={tagToSlug(t) === currentSlug ? { background: '#7c3aed' } : undefined}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
        <Link
          href={playUrl}
          className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          <Play size={14} />
          Play Story
        </Link>
      </div>
    </div>
  )
}

function StorySection({
  icon: Icon,
  title,
  stories,
  currentSlug,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  stories: TagStory[]
  currentSlug: string
}) {
  if (stories.length === 0) return null
  return (
    <div className="mb-12">
      <h2 className="flex items-center gap-2 text-xl font-bold mb-5" style={{ color: '#1e0a3c' }}>
        <Icon size={18} className="text-violet-500" />
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map(story => (
          <StoryCard key={story.id} story={story} currentSlug={currentSlug} />
        ))}
      </div>
    </div>
  )
}

export default async function TagPage({ params }: Props) {
  const { tag: slug } = await params
  const allTags = await getAllPublicTags()
  const variants = allTags.filter(t => tagToSlug(t) === slug)
  if (variants.length === 0) notFound()
  const label = pickDisplayLabel(variants)

  const stories = await getPublicAdventuresByTag(variants)
  if (stories.length === 0) notFound()

  const intro = getTagIntro(label)
  const faq = getTagFaq(label)

  const relatedGenres = (() => {
    const seenSlugs = new Set<string>([slug])
    const result: { label: string; slug: string }[] = []
    for (const t of allTags) {
      const tSlug = tagToSlug(t)
      if (seenSlugs.has(tSlug)) continue
      seenSlugs.add(tSlug)
      result.push({ label: t, slug: tSlug })
    }
    return result.slice(0, 10)
  })()

  // Curate Featured / Popular / New once there's enough content to make the split meaningful.
  let featured: TagStory[] = []
  let popular: TagStory[] = []
  let newest: TagStory[] = []
  let rest: TagStory[] = stories

  if (stories.length > CURATION_THRESHOLD) {
    featured = [...stories]
      .sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1) || b.readCount - a.readCount)
      .slice(0, 3)
    const featuredIds = new Set(featured.map(s => s.id))
    const afterFeatured = stories.filter(s => !featuredIds.has(s.id))

    popular = [...afterFeatured].sort((a, b) => b.readCount - a.readCount).slice(0, 4)
    const popularIds = new Set(popular.map(s => s.id))
    const afterPopular = afterFeatured.filter(s => !popularIds.has(s.id))

    newest = [...afterPopular]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
    const newestIds = new Set(newest.map(s => s.id))

    rest = afterPopular.filter(s => !newestIds.has(s.id))
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={faqSchema} />

      {/* Header */}
      <div
        className="-mt-16 px-6 pt-28 pb-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(124,58,237,0.2) 0%, transparent 65%)' }} />
        <div className="relative max-w-5xl mx-auto">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-violet-300 hover:text-white text-sm transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            All stories
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            {label} Stories
          </h1>
          <p className="text-white/50 text-base mb-4">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} · free to read
          </p>
          <p className="text-white/70 text-base leading-relaxed max-w-2xl">
            {intro}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {stories.length > CURATION_THRESHOLD ? (
          <>
            <StorySection icon={Sparkles} title={`Featured ${label} Stories`} stories={featured} currentSlug={slug} />
            <StorySection icon={Flame} title={`Popular ${label} Stories`} stories={popular} currentSlug={slug} />
            <StorySection icon={Star} title={`New ${label} Stories`} stories={newest} currentSlug={slug} />
            <StorySection icon={Play} title={`More ${label} Stories`} stories={rest} currentSlug={slug} />
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {stories.map(story => (
              <StoryCard key={story.id} story={story} currentSlug={slug} />
            ))}
          </div>
        )}

        {/* Related genres */}
        {relatedGenres.length > 0 && (
          <div className="mb-12 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1e0a3c' }}>Related Genres</h2>
            <div className="flex flex-wrap gap-2">
              {relatedGenres.map(genre => (
                <Link
                  key={genre.slug}
                  href={`/explore/${genre.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                >
                  {genre.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mb-12 pt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold mb-5" style={{ color: '#1e0a3c' }}>Frequently Asked Questions</h2>
          <div className="flex flex-col gap-5 max-w-2xl">
            {faq.map(item => (
              <div key={item.question}>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#1e0a3c' }}>{item.question}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-8 py-8 text-center">
          <h2 className="text-xl font-bold text-violet-900 mb-2">
            Write your own {label} story
          </h2>
          <p className="text-sm text-violet-600 mb-5 max-w-md mx-auto">
            Build a branching adventure with a visual canvas. From $2/week — cancel anytime.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            <Pencil size={14} />
            Start writing
          </Link>
        </div>
      </div>
    </div>
  )
}
