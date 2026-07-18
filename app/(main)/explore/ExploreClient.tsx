'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Play, BookOpen, Search, X, Flame, Sword } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import ReviewsModal from '@/components/explore/ReviewsModal'
import PageBanner from '@/components/shared/PageBanner'
import ShareButtons from '@/components/shared/ShareButtons'
import type { ExploreStory } from '@/lib/exploreData'

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

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw ?? '[]') } catch { return [] }
}

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

  // Build sorted tag list with counts — only from stories visible to this user
  const tagStats = useMemo(() => {
    const counts = new Map<string, number>()
    for (const story of initialStories) {
      if (story.audience === 'adults' && !isAdult) continue
      for (const tag of parseTags(story.tags)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
    const maxCount = sorted[0]?.[1] ?? 1
    const popularThreshold = Math.max(2, Math.ceil(maxCount * 0.6))
    return sorted.map(([tag, count]) => ({ tag, count, popular: count >= popularThreshold }))
  }, [initialStories, isAdult])

  // Filtered stories
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
        const matchesTitle = story.title.toLowerCase().includes(q)
        const matchesTag = tags.some(t => t.toLowerCase().includes(q))
        if (!matchesTitle && !matchesTag) return false
      }
      return true
    })
  }, [initialStories, selectedAudience, selectedTag, selectedStoryType, search, isAdult])

  const activeFilterCount = (selectedAudience ? 1 : 0) + (selectedTag ? 1 : 0) + (selectedStoryType ? 1 : 0) + (search.trim() ? 1 : 0)

  return (
    <>
      <PageBanner title="Explore Stories" subtitle="Play public stories shared by creators" wide>
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or tag…"
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

        {/* Mobile filters */}
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
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
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
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col gap-6 w-52 shrink-0 sticky top-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#7c3aed' }}>Audience</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedAudience(null)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !selectedAudience
                      ? 'bg-violet-100 text-violet-800 font-semibold'
                      : 'text-gray-600 hover:bg-violet-50'
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
                    !selectedStoryType
                      ? 'bg-violet-100 text-violet-800 font-semibold'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStoryType(selectedStoryType === 'path' ? null : 'path')}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedStoryType === 'path'
                      ? 'bg-violet-100 text-violet-800 font-semibold'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  Story Path
                </button>
                <button
                  onClick={() => setSelectedStoryType(selectedStoryType === 'world' ? null : 'world')}
                  className={`flex items-center gap-1.5 text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedStoryType === 'world'
                      ? 'bg-amber-100 text-amber-800 font-semibold'
                      : 'text-amber-700 hover:bg-amber-50'
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
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`flex items-center justify-between gap-2 text-left px-3 py-1.5 rounded-lg text-sm transition-colors group ${
                        selectedTag === tag
                          ? 'bg-violet-100 text-violet-800 font-semibold'
                          : 'text-gray-600 hover:bg-violet-50'
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
                onClick={() => { setSelectedAudience(null); setSelectedTag(null); setSelectedStoryType(null); setSearch('') }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Clear all filters
              </button>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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
                      onClick={() => { setSelectedAudience(null); setSelectedTag(null); setSelectedStoryType(null); setSearch('') }}
                      className="mt-3 text-sm text-violet-500 hover:underline"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((story, i) => {
                  const tags = parseTags(story.tags)
                  return (
                    <div
                      key={story.id}
                      className="bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
                      style={{ border: story.storyType === 'world' ? '1px solid #fcd34d' : '1px solid #ede9fe' }}
                    >
                      {story.coverImageUrl ? (
                        <div className="w-full h-36 overflow-hidden shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={story.coverImageUrl}
                            alt={story.title}
                            className="w-full h-full object-cover"
                            loading={i < 6 ? 'eager' : 'lazy'}
                          />
                          {story.storyType === 'world' && (
                            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                              style={{ background: 'rgba(180,83,9,0.85)', backdropFilter: 'blur(4px)' }}>
                              <Sword size={9} />
                              World Builder
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-1.5 w-full"
                          style={{ background: story.storyType === 'world'
                            ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                            : 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
                        />
                      )}
                      <div className="flex-1 p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex flex-col gap-1 min-w-0">
                            {story.storyType === 'world' && !story.coverImageUrl && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full w-fit">
                                <Sword size={9} />
                                World Builder
                              </span>
                            )}
                            <h2 className="text-lg font-bold" style={{ color: '#1e0a3c' }}>{story.title}</h2>
                          </div>
                          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap">
                            {AUDIENCE_LABEL[story.audience] ?? story.audience}
                          </span>
                        </div>
                        {story.avgRating !== null && (
                          <button
                            onClick={() => setReviewsModal({ id: story.id, title: story.title })}
                            className="flex items-center gap-1.5 mt-1 mb-1 hover:opacity-75 transition-opacity"
                            title="Read reviews"
                          >
                            <span className="text-amber-400 text-sm leading-none">{'★'.repeat(Math.round(story.avgRating))}{'☆'.repeat(5 - Math.round(story.avgRating))}</span>
                            <span className="text-xs text-gray-500">{story.avgRating.toFixed(1)}</span>
                            <span className="text-xs text-violet-600 underline underline-offset-2">
                              {story.reviewCount} {story.reviewCount === 1 ? 'review' : 'reviews'}
                            </span>
                          </button>
                        )}
                        {story.description && (
                          <p className="text-gray-500 text-sm line-clamp-3">{story.description}</p>
                        )}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                  tag === selectedTag
                                    ? 'text-white'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                }`}
                                style={tag === selectedTag ? { background: '#7c3aed' } : undefined}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                        <Link
                          href={`/play/${story.id}`}
                          onClick={() => analytics.exploreStoryClicked(story.id, story.title)}
                          className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                        >
                          <Play size={14} />
                          Play Story
                        </Link>
                      </div>
                      <div className="px-5 py-3 border-t border-violet-100 bg-violet-50/40">
                        <ShareButtons
                          title={story.title}
                          url={
                            story.shareToken
                              ? `https://www.storyquestor.com/s/${story.shareToken}`
                              : `https://www.storyquestor.com/play/${story.id}`
                          }
                        />
                      </div>
                    </div>
                  )
                })}
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
