'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, BookOpen } from 'lucide-react'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults',
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

export default function ExplorePage() {
  const [stories, setStories] = useState<PublicStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/explore')
      .then(r => r.json())
      .then(data => { setStories(data); setLoading(false) })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Stories</h1>
        <p className="text-gray-500 mt-1">Play public adventures shared by creators</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-lg">No public stories yet.</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to share one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map(story => {
            const tags: string[] = (() => { try { return JSON.parse(story.tags ?? '[]') } catch { return [] } })()
            return (
              <div key={story.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{story.title}</h2>
                    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {AUDIENCE_LABEL[story.audience] ?? story.audience}
                    </span>
                  </div>
                  {story.description && (
                    <p className="text-gray-500 text-sm line-clamp-3">{story.description}</p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/play/${story.id}`}
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
  )
}
