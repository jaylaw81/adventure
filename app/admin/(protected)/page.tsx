'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Play, Search, X, Globe, Lock, ExternalLink, BarChart2 } from 'lucide-react'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults',
}

const AUDIENCE_COLOR: Record<string, string> = {
  all: 'bg-green-100 text-green-700',
  teens: 'bg-amber-100 text-amber-700',
  adults: 'bg-red-100 text-red-700',
}

interface AdminStory {
  id: string
  title: string
  description: string
  userEmail: string | null
  audience: string
  isPublic: boolean
  tags: string
  sceneCount: number
  pendingReports: number
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const [stories, setStories] = useState<AdminStory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/stories')
      .then(r => r.json())
      .then(data => { setStories(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stories
    return stories.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.userEmail ?? '').toLowerCase().includes(q) ||
      (s.description ?? '').toLowerCase().includes(q)
    )
  }, [stories, search])

  const stats = useMemo(() => ({
    total: stories.length,
    public: stories.filter(s => s.isPublic).length,
    uniqueUsers: new Set(stories.map(s => s.userEmail)).size,
  }), [stories])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Stories</h1>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <p className="text-slate-500 text-sm">All stories across all users</p>
          <div className="w-px h-3.5 bg-slate-200 shrink-0" />
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.total}</span> total</span>
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.public}</span> public</span>
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.uniqueUsers}</span> authors</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author email, or description…"
          className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
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
          <div className="p-12 text-center text-slate-400 text-sm">No stories found.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">{story.title}</p>
                      {story.pendingReports > 0 && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          ⚠ {story.pendingReports}
                        </span>
                      )}
                    </div>
                    {story.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{story.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs font-mono">
                    {story.userEmail ?? '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AUDIENCE_COLOR[story.audience] ?? 'bg-slate-100 text-slate-600'}`}>
                      {AUDIENCE_LABEL[story.audience] ?? story.audience}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{story.sceneCount}</td>
                  <td className="px-4 py-4">
                    {story.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <Globe size={12} /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Lock size={12} /> Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/play/${story.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Play size={11} />
                        Play
                      </Link>
                      <Link
                        href={`/edit/${story.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        <ExternalLink size={11} />
                        Edit
                      </Link>
                      <Link
                        href={`/admin/referrers/${story.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <BarChart2 size={11} />
                        Traffic
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      {!loading && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          {filtered.length} of {stories.length} stories
        </p>
      )}
    </div>
  )
}
