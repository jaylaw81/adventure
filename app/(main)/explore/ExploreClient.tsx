'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Play, BookOpen, Search, X, Flame, Sword, Eye } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import ReviewsModal from '@/components/explore/ReviewsModal'
import PageBanner from '@/components/shared/PageBanner'
import ShareButtons from '@/components/shared/ShareButtons'
import type { ExploreStory } from '@/lib/exploreData'

// ── Constants ──────────────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Ages' },
  { value: 'teens', label: 'Teens' },
  { value: 'adults', label: 'Adults Only' },
]

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults Only',
}

const POPULAR_THRESHOLD = 10

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw ?? '[]') } catch { return [] }
}

function formatReads(n: number): string {
  if (n === 0) return 'No reads yet'
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k reads`
  return `${n.toLocaleString()} ${n === 1 ? 'read' : 'reads'}`
}

function storyUrl(story: ExploreStory): string {
  if (story.storySlug) return `https://www.storyquestor.com/story/${story.storySlug}`
  if (story.shareToken) return `https://www.storyquestor.com/s/${story.shareToken}`
  return `https://www.storyquestor.com/play/${story.id}`
}

function storyPath(story: ExploreStory): string {
  if (story.storySlug) return `/story/${story.storySlug}`
  return `/play/${story.id}`
}

// ── Card subcomponents ─────────────────────────────────────────────────────────

interface CardProps {
  story: ExploreStory
  cardIndex: number
  selectedTag: string | null
  onTagClick: (tag: string) => void
  onReviewClick: (id: string, title: string) => void
}

function Byline({ story }: { story: ExploreStory }) {
  if (story.authorUsername && story.authorProfileVisible) {
    return (
      <Link
        href={`/u/${story.authorUsername}`}
        onClick={e => e.stopPropagation()}
        className="text-xs text-violet-500 hover:text-violet-700 transition-colors w-fit"
      >
        by @{story.authorUsername}
      </Link>
    )
  }
  if (story.authorUsername) {
    return <span className="text-xs text-gray-400 w-fit">by @{story.authorUsername}</span>
  }
  if (story.authorDisplayName) {
    return <span className="text-xs text-gray-400 w-fit">by {story.authorDisplayName}</span>
  }
  return null
}

function RatingRow({ story, onReviewClick }: { story: ExploreStory; onReviewClick: (id: string, title: string) => void }) {
  if (story.avgRating === null) return null
  return (
    <button
      onClick={() => onReviewClick(story.id, story.title)}
      className="flex items-center gap-1.5 hover:opacity-75 transition-opacity w-fit"
    >
      <span className="text-amber-400 text-sm leading-none">
        {'★'.repeat(Math.round(story.avgRating))}{'☆'.repeat(5 - Math.round(story.avgRating))}
      </span>
      <span className="text-xs text-gray-500">{story.avgRating.toFixed(1)}</span>
      <span className="text-xs text-violet-600 underline underline-offset-2">
        {story.reviewCount} {story.reviewCount === 1 ? 'review' : 'reviews'}
      </span>
    </button>
  )
}

// Featured card — spans full content width, horizontal on md+
function FeaturedCard({ story, selectedTag, onTagClick, onReviewClick }: CardProps) {
  const tags = parseTags(story.tags)
  const isWorld = story.storyType === 'world'
  const isPopular = story.readCount >= POPULAR_THRESHOLD

  return (
    <div
      className="sq-card bg-white rounded-xl overflow-hidden mb-6"
      style={{
        border: isWorld ? '1px solid #fcd34d' : '1px solid #ede9fe',
        animationDelay: '0ms',
      }}
    >
      <div className="flex flex-col md:flex-row group">

        {/* Left: image or decorative placeholder */}
        {story.coverImageUrl ? (
          <div className="md:w-[42%] h-56 md:h-auto overflow-hidden shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="sq-card-img w-full h-full object-cover"
              loading="eager"
            />
            {isWorld && (
              <span
                className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'rgba(180,83,9,0.85)', backdropFilter: 'blur(4px)' }}
              >
                <Sword size={9} />
                World Builder
              </span>
            )}
            {isPopular && (
              <span
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-900"
                style={{ background: 'rgba(253,230,138,0.95)', backdropFilter: 'blur(4px)' }}
              >
                <Flame size={9} className="text-orange-500" />
                Popular
              </span>
            )}
          </div>
        ) : (
          <div
            className="hidden md:flex md:w-[42%] items-center justify-center shrink-0"
            style={{
              background: isWorld
                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                : 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
              minHeight: '220px',
            }}
          >
            <BookOpen size={72} className={isWorld ? 'text-amber-300' : 'text-violet-300'} />
          </div>
        )}

        {/* Right: content */}
        <div className="flex-1 p-6 flex flex-col gap-3 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap min-h-[22px]">
            {isWorld && !story.coverImageUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                <Sword size={9} />
                World Builder
              </span>
            )}
            {isPopular && !story.coverImageUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                <Flame size={9} />
                Popular
              </span>
            )}
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap">
              {AUDIENCE_LABEL[story.audience] ?? story.audience}
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-snug" style={{ color: '#1e0a3c' }}>
            {story.title}
          </h2>

          <Byline story={story} />

          <RatingRow story={story} onReviewClick={onReviewClick} />

          {story.description && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">{story.description}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    tag === selectedTag ? 'text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                  style={tag === selectedTag ? { background: '#7c3aed' } : undefined}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 flex items-end justify-between gap-4 border-t border-violet-50">
            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Eye size={12} />
                {formatReads(story.readCount)}
              </span>
              <ShareButtons title={story.title} url={storyUrl(story)} />
            </div>
            <Link
              href={storyPath(story)}
              onClick={() => analytics.exploreStoryClicked(story.id, story.title)}
              className="sq-play-btn shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              <Play size={14} />
              Play Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Regular story card
function StoryCard({ story, cardIndex, selectedTag, onTagClick, onReviewClick }: CardProps) {
  const tags = parseTags(story.tags)
  const isWorld = story.storyType === 'world'
  const isPopular = story.readCount >= POPULAR_THRESHOLD

  return (
    <div
      className="sq-card bg-white rounded-xl flex flex-col overflow-hidden group"
      style={{
        border: isWorld ? '1px solid #fcd34d' : '1px solid #ede9fe',
        animationDelay: `${Math.min(cardIndex * 55, 300)}ms`,
      }}
    >
      {story.coverImageUrl ? (
        <div className="w-full h-44 overflow-hidden shrink-0 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="sq-card-img w-full h-full object-cover"
            loading={cardIndex < 5 ? 'eager' : 'lazy'}
          />
          {isWorld && (
            <span
              className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: 'rgba(180,83,9,0.85)', backdropFilter: 'blur(4px)' }}
            >
              <Sword size={9} />
              World Builder
            </span>
          )}
          {isPopular && (
            <span
              className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-900"
              style={{ background: 'rgba(253,230,138,0.95)', backdropFilter: 'blur(4px)' }}
            >
              <Flame size={9} className="text-orange-500" />
              Popular
            </span>
          )}
        </div>
      ) : (
        <div
          className="h-1.5 w-full"
          style={{
            background: isWorld
              ? 'linear-gradient(90deg, #d97706, #f59e0b)'
              : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
          }}
        />
      )}

      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            {isWorld && !story.coverImageUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full w-fit">
                <Sword size={9} />
                World Builder
              </span>
            )}
            {isPopular && !story.coverImageUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit border border-orange-100">
                <Flame size={9} />
                Popular
              </span>
            )}
            <h2 className="text-lg font-bold" style={{ color: '#1e0a3c' }}>{story.title}</h2>
            <Byline story={story} />
          </div>
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap">
            {AUDIENCE_LABEL[story.audience] ?? story.audience}
          </span>
        </div>

        <RatingRow story={story} onReviewClick={onReviewClick} />

        {story.description && (
          <p className="text-gray-500 text-sm line-clamp-3">{story.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  tag === selectedTag ? 'text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
                style={tag === selectedTag ? { background: '#7c3aed' } : undefined}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <Link
          href={storyPath(story)}
          onClick={() => analytics.exploreStoryClicked(story.id, story.title)}
          className="sq-play-btn mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          <Play size={14} />
          Play Story
        </Link>
      </div>

      <div className="px-5 pt-3 pb-4 border-t border-violet-100 bg-violet-50/40 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
          <Eye size={12} className="shrink-0" />
          {formatReads(story.readCount)}
        </span>
        <ShareButtons title={story.title} url={storyUrl(story)} />
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  initialStories: ExploreStory[]
  isAdult: boolean
  isSignedIn: boolean
}

export default function ExploreClient({ initialStories, isAdult, isSignedIn }: Props) {
  const [search, setSearch] = useState('')
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedStoryType, setSelectedStoryType] = useState<string | null>(null)
  const [reviewsModal, setReviewsModal] = useState<{ id: string; title: string } | null>(null)

  const tagStats = useMemo(() => {
    const counts = new Map<string, number>()
    for (const story of initialStories) {
      if (story.audience === 'adults' && !isAdult) continue
      for (const tag of parseTags(story.tags)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
    const maxCount = sorted[0]?.[1] ?? 1
    const popularThreshold = Math.max(2, Math.ceil(maxCount * 0.6))
    return sorted.map(([tag, count]) => ({ tag, count, popular: count >= popularThreshold }))
  }, [initialStories, isAdult])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialStories.filter(story => {
      if (story.audience === 'adults' && !isAdult) return false
      if (selectedAudience && story.audience !== selectedAudience) return false
      if (selectedTag && !parseTags(story.tags).includes(selectedTag)) return false
      if (selectedStoryType === 'world' && story.storyType !== 'world') return false
      if (selectedStoryType === 'path' && story.storyType === 'world') return false
      if (q) {
        const tags = parseTags(story.tags)
        const matchesUsername = !!story.authorUsername && story.authorUsername.toLowerCase().includes(q)
        if (!story.title.toLowerCase().includes(q) && !tags.some(t => t.toLowerCase().includes(q)) && !matchesUsername) return false
      }
      return true
    })
  }, [initialStories, selectedAudience, selectedTag, selectedStoryType, search, isAdult])

  const activeFilterCount =
    (selectedAudience ? 1 : 0) + (selectedTag ? 1 : 0) + (selectedStoryType ? 1 : 0) + (search.trim() ? 1 : 0)

  function clearAllFilters() {
    setSelectedAudience(null)
    setSelectedTag(null)
    setSelectedStoryType(null)
    setSearch('')
  }

  const handleTagClick = (tag: string) => setSelectedTag(prev => prev === tag ? null : tag)
  const handleReviewClick = (id: string, title: string) => setReviewsModal({ id, title })

  const [featuredStory, ...restStories] = filtered

  return (
    <>
      {/* Scoped styles for card animations + hover effects */}
      <style>{`
        .sq-card {
          box-shadow: 0 1px 3px rgba(124,58,237,0.06);
          transition:
            transform 0.22s cubic-bezier(0.25, 1, 0.5, 1),
            box-shadow 0.22s cubic-bezier(0.25, 1, 0.5, 1);
          animation: sq-card-in 0.4s ease-out both;
        }
        .sq-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(124,58,237,0.14);
        }
        .sq-card-img {
          transition: transform 0.55s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .sq-card:hover .sq-card-img {
          transform: scale(1.06);
        }
        @keyframes sq-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sq-play-btn {
          transition: filter 0.15s, transform 0.1s;
        }
        .sq-play-btn:hover  { filter: brightness(1.1); }
        .sq-play-btn:active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) {
          .sq-card {
            animation: none;
            transition: box-shadow 0.15s;
          }
          .sq-card:hover { transform: none; }
          .sq-card-img { transition: none; }
          .sq-card:hover .sq-card-img { transform: none; }
        }
      `}</style>

      <PageBanner title="Explore Stories" subtitle="Play public stories shared by creators" wide>
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, tag, or creator…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-white placeholder-white/40"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </PageBanner>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!isSignedIn && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <p className="text-sm text-violet-800">
              <span className="font-semibold">Sign in for full access</span> — some stories and tags are only visible to registered members.
            </p>
            <Link
              href="/sign-in"
              className="shrink-0 px-4 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors hover:brightness-110"
              style={{ background: '#7c3aed' }}
            >
              Sign in
            </Link>
          </div>
        )}

        {/* Mobile filter strips */}
        <div className="md:hidden mb-4 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedAudience(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !selectedAudience ? 'text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={!selectedAudience ? { background: '#7c3aed' } : undefined}
            >
              All Audiences
            </button>
            {AUDIENCE_OPTIONS.filter(opt => opt.value !== 'adults' || isAdult).map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedAudience(selectedAudience === opt.value ? null : opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedAudience === opt.value ? 'text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
                style={selectedAudience === opt.value ? { background: '#7c3aed' } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedStoryType(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !selectedStoryType ? 'text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={!selectedStoryType ? { background: '#7c3aed' } : undefined}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedStoryType(selectedStoryType === 'path' ? null : 'path')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedStoryType === 'path' ? 'text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={selectedStoryType === 'path' ? { background: '#7c3aed' } : undefined}
            >
              Story Path
            </button>
            <button
              onClick={() => setSelectedStoryType(selectedStoryType === 'world' ? null : 'world')}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedStoryType === 'world' ? 'text-white border-amber-500' : 'bg-white text-amber-700 border-amber-200'
              }`}
              style={selectedStoryType === 'world' ? { background: '#d97706' } : undefined}
            >
              <Sword size={10} />
              World Builder
            </button>
          </div>
          {tagStats.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tagStats.slice(0, 10).map(({ tag, popular }) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedTag === tag ? 'text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                  style={selectedTag === tag ? { background: '#7c3aed' } : undefined}
                >
                  {popular && <Flame size={10} className={selectedTag === tag ? 'text-orange-200' : 'text-orange-400'} />}
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col gap-6 w-52 shrink-0 sticky top-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#7c3aed' }}>Audience</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedAudience(null)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !selectedAudience ? 'bg-violet-100 text-violet-800 font-semibold' : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  All
                </button>
                {AUDIENCE_OPTIONS.filter(opt => opt.value !== 'adults' || isAdult).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedAudience(selectedAudience === opt.value ? null : opt.value)}
                    className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedAudience === opt.value
                        ? 'bg-violet-100 text-violet-800 font-semibold'
                        : 'text-gray-600 hover:bg-violet-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#7c3aed' }}>Story Type</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedStoryType(null)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !selectedStoryType ? 'bg-violet-100 text-violet-800 font-semibold' : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStoryType(selectedStoryType === 'path' ? null : 'path')}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedStoryType === 'path' ? 'bg-violet-100 text-violet-800 font-semibold' : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  Story Path
                </button>
                <button
                  onClick={() => setSelectedStoryType(selectedStoryType === 'world' ? null : 'world')}
                  className={`flex items-center gap-1.5 text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedStoryType === 'world' ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Sword size={12} className="shrink-0" />
                  World Builder
                </button>
              </div>
            </div>

            {tagStats.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#7c3aed' }}>Tags</h3>
                <div className="flex flex-col gap-1">
                  {tagStats.map(({ tag, count, popular }) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`flex items-center justify-between gap-2 text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedTag === tag ? 'bg-violet-100 text-violet-800 font-semibold' : 'text-gray-600 hover:bg-violet-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        {popular && <Flame size={11} className="text-orange-400 shrink-0" />}
                        <span className="truncate">{tag}</span>
                      </span>
                      <span className={`text-xs shrink-0 ${selectedTag === tag ? 'text-violet-600' : 'text-gray-400'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Clear all filters
              </button>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips + count */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedAudience && (
                  <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    {AUDIENCE_LABEL[selectedAudience]}
                    <button onClick={() => setSelectedAudience(null)} className="hover:text-violet-600"><X size={11} /></button>
                  </span>
                )}
                {selectedStoryType && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    {selectedStoryType === 'world' ? <><Sword size={10} /> World Builder</> : 'Story Path'}
                    <button onClick={() => setSelectedStoryType(null)} className="hover:text-amber-600"><X size={11} /></button>
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    #{selectedTag}
                    <button onClick={() => setSelectedTag(null)} className="hover:text-violet-600"><X size={11} /></button>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#ede9fe' }}>
                  <BookOpen size={28} style={{ color: '#7c3aed' }} />
                </div>
                {initialStories.length === 0 ? (
                  <>
                    <p className="text-lg font-semibold mb-1" style={{ color: '#1e0a3c' }}>No public stories yet.</p>
                    <p className="text-sm text-gray-400">Be the first to share one!</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold mb-1" style={{ color: '#1e0a3c' }}>No stories match your filters.</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 text-sm text-violet-500 hover:underline"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {/* Featured first story */}
                {featuredStory && (
                  <FeaturedCard
                    story={featuredStory}
                    cardIndex={0}
                    selectedTag={selectedTag}
                    onTagClick={handleTagClick}
                    onReviewClick={handleReviewClick}
                  />
                )}

                {/* Rest of the grid */}
                {restStories.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {restStories.map((story, i) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        cardIndex={i + 1}
                        selectedTag={selectedTag}
                        onTagClick={handleTagClick}
                        onReviewClick={handleReviewClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {reviewsModal && (
          <ReviewsModal
            adventureId={reviewsModal.id}
            adventureTitle={reviewsModal.title}
            onClose={() => setReviewsModal(null)}
          />
        )}
      </div>
    </>
  )
}
