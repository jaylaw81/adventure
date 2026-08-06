import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Play, ArrowLeft, Pencil } from 'lucide-react'
import { getPublicAdventuresByTag } from '@/lib/queries'

const SITE_URL = 'https://www.storyquestor.com'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults Only',
}

interface Props {
  params: Promise<{ tag: string }>
}

function slugToTag(slug: string): string {
  return decodeURIComponent(slug)
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const label = capitalize(slugToTag(tag))
  const title = `${label} Interactive Stories — StoryQuestor`
  const description = `Browse free ${label.toLowerCase()} choose-your-own-adventure stories. Every story branches — your choices shape the ending.`
  return {
    title: { absolute: title },
    description,
    keywords: ['interactive story', 'choose your own adventure', label.toLowerCase(), `${label.toLowerCase()} stories`],
    alternates: { canonical: `${SITE_URL}/explore/${tag}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/explore/${tag}`,
      images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
    },
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const label = slugToTag(tag)
  const stories = await getPublicAdventuresByTag(label)

  if (stories.length === 0) notFound()

  return (
    <div className="flex flex-col min-h-screen">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/30 bg-amber-400/10 mb-4">
            #{label}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            {capitalize(label)} Stories
          </h1>
          <p className="text-white/50 text-base">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} · free to read
          </p>
        </div>
      </div>

      {/* Story grid */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map(story => {
            const tags: string[] = (() => { try { return JSON.parse(story.tags ?? '[]') } catch { return [] } })()
            const playUrl = story.shareToken
              ? `${SITE_URL}/s/${story.shareToken}`
              : `/play/${story.id}`
            return (
              <div
                key={story.id}
                className="bg-white rounded-2xl shadow-sm flex flex-col border border-violet-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
              >
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
                    <h2 className="text-base font-bold" style={{ color: '#1e0a3c' }}>{story.title}</h2>
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
                          href={`/explore/${encodeURIComponent(t)}`}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            t === label
                              ? 'text-white'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                          style={t === label ? { background: '#7c3aed' } : undefined}
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
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-2xl border border-violet-200 bg-violet-50 px-8 py-8 text-center">
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
