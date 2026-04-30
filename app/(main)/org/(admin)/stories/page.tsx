'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, Globe, Lock, Play, ExternalLink } from 'lucide-react'

interface OrgStory {
  id: string
  title: string
  description: string
  userEmail: string | null
  isPublic: boolean
  audience: string
  sceneCount: number
  createdAt: string
}

const AUDIENCE_COLOR: Record<string, string> = {
  all: 'bg-green-100 text-green-700',
  teens: 'bg-amber-100 text-amber-700',
  adults: 'bg-red-100 text-red-700',
}

export default function OrgStoriesPage() {
  const [stories, setStories] = useState<OrgStory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/org/stories')
      .then(r => r.json())
      .then(data => { setStories(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stories
    return stories.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.userEmail ?? '').toLowerCase().includes(q)
    )
  }, [stories, search])

  async function toggleVisibility(story: OrgStory) {
    setToggling(story.id)
    const res = await fetch(`/api/org/stories/${story.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !story.isPublic }),
    })
    if (res.ok) {
      const { isPublic } = await res.json()
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, isPublic } : s))
    }
    setToggling(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Member Stories</h1>
        <p className="text-slate-500 text-sm mt-1">Review and control the visibility of all organization stories</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-6 text-sm text-slate-500">
        <span><strong className="text-slate-900">{stories.length}</strong> total</span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1"><Globe size={13} className="text-green-500" /> <strong className="text-slate-900">{stories.filter(s => s.isPublic).length}</strong> public</span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1"><Lock size={13} className="text-slate-400" /> <strong className="text-slate-900">{stories.filter(s => !s.isPublic).length}</strong> private</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or author email…"
          className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {stories.length === 0 ? 'No stories yet from your members.' : 'No stories match your search.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Story</th>
                <th className="text-left px-4 py-3 font-semibold">Author</th>
                <th className="text-left px-4 py-3 font-semibold">Audience</th>
                <th className="text-left px-4 py-3 font-semibold">Scenes</th>
                <th className="text-left px-4 py-3 font-semibold">Visibility</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(story => (
                <tr key={story.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="font-medium text-slate-900 truncate">{story.title}</p>
                    {story.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{story.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-slate-500">{story.userEmail ?? '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AUDIENCE_COLOR[story.audience] ?? 'bg-slate-100 text-slate-600'}`}>
                      {story.audience === 'all' ? 'All ages' : story.audience}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{story.sceneCount}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleVisibility(story)}
                      disabled={toggling === story.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        story.isPublic
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {story.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                      {story.isPublic ? 'Public' : 'Private'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/play/${story.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Play size={11} /> Play
                      </Link>
                      <Link
                        href={`/edit/${story.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        <ExternalLink size={11} /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && (
        <p className="text-xs text-slate-400 mt-3 text-right">{filtered.length} of {stories.length} stories</p>
      )}
    </div>
  )
}
