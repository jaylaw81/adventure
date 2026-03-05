'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Play, BookOpen, Search, X, Flame } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { analytics } from '@/lib/analytics'

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

interface PublicStory {
  id: string
  title: string
  description: string
  audience: string
  tags: string
  shareToken: string | null
  createdAt: string
}

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw ?? '[]') } catch { return [] }
}

export default function ExplorePage() {
  const { data: session } = useSession()
  const [stories, setStories] = useState<PublicStory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/explore')
      .then(r => r.json())
      .then(data => { setStories(data); setLoading(false) })
  }, [])

  const isAdult = session?.user?.isAdult ?? false
  const isSignedIn = !!session

  // Build sorted tag list with counts — only from stories visible to this user
  const tagStats = useMemo(() => {
    const counts = new Map<string, number>()
    for (const story of stories) {
      if (story.audience === 'adults' && !isAdult) continue
      for (const tag of parseTags(story.tags)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
    const maxCount = sorted[0]?.[1] ?? 1
    // "Popular" = top third by count (min 2 stories)
    const popularThreshold = Math.max(2, Math.ceil(maxCount * 0.6))
    return sorted.map(([tag, count]) => ({ tag, count, popular: count >= popularThreshold }))
  }, [stories, isAdult])

  // Filtered stories
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return stories.filter(story => {
      // Hide adults-only stories from non-adults and guests
      if (story.audience === 'adults' && !isAdult) return false
      if (selectedAudience && story.audience !== selectedAudience) return false
      if (selectedTag && !parseTags(story.tags).includes(selectedTag)) return false
      if (q) {
        const tags = parseTags(story.tags)
        const matchesTitle = story.title.toLowerCase().includes(q)
        const matchesTag = tags.some(t => t.toLowerCase().includes(q))
        if (!matchesTitle && !matchesTag) return false
      }
      return true
    })
  }, [stories, selectedAudience, selectedTag, search, isAdult])

  const activeFilterCount = (selectedAudience ? 1 : 0) + (selectedTag ? 1 : 0) + (search.trim() ? 1 : 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Explore Stories</h1>
        <p className="text-gray-500 mt-1">Play public adventures shared by creators</p>
      </div>

      {/* Registration nudge for guests */}
      {!isSignedIn && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Sign in for full access</span> — some stories and tags are only visible to registered members.
          </p>
          <Link
            href="/sign-in"
            className="shrink-0 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or tag…"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-6 w-52 shrink-0 sticky top-6">

          {/* Audience */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Audience</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedAudience(null)}
                className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !selectedAudience
                    ? 'bg-amber-100 text-amber-800 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {AUDIENCE_OPTIONS.filter(opt => opt.value !== 'adults' || (session?.user?.isAdult ?? false)).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedAudience(selectedAudience === opt.value ? null : opt.value)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedAudience === opt.value
                      ? 'bg-amber-100 text-amber-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tagStats.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Tags</h3>
              <div className="flex flex-col gap-1">
                {tagStats.map(({ tag, count, popular }) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`flex items-center justify-between gap-2 text-left px-3 py-1.5 rounded-lg text-sm transition-colors group ${
                      selectedTag === tag
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {popular && <Flame size={11} className="text-orange-400 shrink-0" />}
                      <span className="truncate">{tag}</span>
                    </span>
                    <span className={`text-xs shrink-0 ${selectedTag === tag ? 'text-amber-600' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSelectedAudience(null); setSelectedTag(null); setSearch('') }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={12} />
              Clear all filters
            </button>
          )}
        </aside>

        {/* Mobile filters (horizontal scroll) */}
        <div className="md:hidden w-full mb-4 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedAudience(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !selectedAudience ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              All Audiences
            </button>
            {AUDIENCE_OPTIONS.filter(opt => opt.value !== 'adults' || isAdult).map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedAudience(selectedAudience === opt.value ? null : opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedAudience === opt.value ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {tagStats.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tagStats.slice(0, 10).map(({ tag, popular }) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedTag === tag ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {popular && <Flame size={10} className={selectedTag === tag ? 'text-orange-200' : 'text-orange-400'} />}
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Active filter pills + result count */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {selectedAudience && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {AUDIENCE_LABEL[selectedAudience]}
                  <button onClick={() => setSelectedAudience(null)} className="hover:text-amber-600"><X size={11} /></button>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)} className="hover:text-amber-600"><X size={11} /></button>
                </span>
              )}
            </div>
            {!loading && (
              <span className="text-xs text-gray-400 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
              {stories.length === 0 ? (
                <>
                  <p className="text-gray-400 text-lg">No public stories yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first to share one!</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-lg">No stories match your filters.</p>
                  <button
                    onClick={() => { setSelectedAudience(null); setSelectedTag(null); setSearch('') }}
                    className="mt-3 text-sm text-amber-500 hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(story => {
                const tags = parseTags(story.tags)
                return (
                  <div key={story.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-900">{story.title}</h2>
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
                          {AUDIENCE_LABEL[story.audience] ?? story.audience}
                        </span>
                      </div>
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
                                  ? 'bg-amber-400 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/play/${story.id}`}
                      onClick={() => analytics.exploreStoryClicked(story.id, story.title)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                    >
                      <Play size={14} />
                      Play
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
