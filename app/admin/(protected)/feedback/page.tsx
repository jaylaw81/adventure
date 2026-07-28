'use client'

import { useEffect, useState, useMemo } from 'react'
import { MessageCircle, CheckCircle2, Eye, Filter } from 'lucide-react'

interface FeedbackItem {
  id: string
  userEmail: string | null
  type: string
  message: string
  pageUrl: string | null
  status: string
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  question: 'bg-blue-50 text-blue-700',
  concern:  'bg-amber-50 text-amber-700',
  other:    'bg-gray-100 text-gray-600',
}

const STATUS_COLORS: Record<string, string> = {
  new:      'bg-violet-50 text-violet-700',
  reviewed: 'bg-amber-50 text-amber-700',
  resolved: 'bg-emerald-50 text-emerald-700',
}

export default function AdminFeedbackPage() {
  const [items, setItems]         = useState<FeedbackItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType]     = useState<string>('all')
  const [updating, setUpdating]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    if (filterType   !== 'all' && item.type   !== filterType)   return false
    return true
  }), [items, filterStatus, filterType])

  const newCount = items.filter(i => i.status === 'new').length

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      }
    } finally {
      setUpdating(null)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <MessageCircle size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Site Feedback</h1>
          <p className="text-sm text-gray-500">
            {newCount > 0 ? `${newCount} unread` : 'All caught up'} · {items.length} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <Filter size={14} className="text-gray-400 shrink-0" />
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['all', 'new', 'reviewed', 'resolved'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                filterStatus === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['all', 'question', 'concern', 'other'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                filterType === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No feedback matches this filter.</div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
          {filtered.map(item => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  item.status === 'new' ? 'bg-violet-500' :
                  item.status === 'reviewed' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                    {item.userEmail && (
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">{item.userEmail}</span>
                    )}
                    {!item.userEmail && (
                      <span className="text-xs text-gray-400 italic">anonymous</span>
                    )}
                  </div>

                  {/* Message */}
                  <p className={`text-sm text-gray-800 leading-relaxed ${expanded === item.id ? '' : 'line-clamp-2'}`}>
                    {item.message}
                  </p>

                  {item.message.length > 120 && (
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="text-xs text-violet-500 hover:text-violet-700 mt-1 transition-colors"
                    >
                      {expanded === item.id ? 'Show less' : 'Show more'}
                    </button>
                  )}

                  {item.pageUrl && (
                    <p className="text-xs text-gray-400 mt-1.5 font-mono">{item.pageUrl}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0">
                  {item.status === 'new' && (
                    <button
                      onClick={() => updateStatus(item.id, 'reviewed')}
                      disabled={updating === item.id}
                      title="Mark as reviewed"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                      <Eye size={12} />
                      Review
                    </button>
                  )}
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(item.id, 'resolved')}
                      disabled={updating === item.id}
                      title="Mark as resolved"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      Resolve
                    </button>
                  )}
                  {item.status === 'resolved' && (
                    <button
                      onClick={() => updateStatus(item.id, 'new')}
                      disabled={updating === item.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
