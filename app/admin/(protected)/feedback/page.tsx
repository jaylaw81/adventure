'use client'

import { useEffect, useState, useMemo } from 'react'
import { MessageCircle, CheckCircle2, Eye, Filter, Reply, Send, X, CornerDownRight } from 'lucide-react'

interface FeedbackItem {
  id: string
  userEmail: string | null
  type: string
  message: string
  pageUrl: string | null
  status: string
  createdAt: string
  replyCount: number
}

function truncateForQuote(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function ReplyModal({
  item,
  onClose,
  onSent,
}: {
  item: FeedbackItem
  onClose: () => void
  onSent: () => void
}) {
  const [subject, setSubject] = useState(`Re: "${truncateForQuote(item.message, 60)}"`)
  const [message, setMessage] = useState(`Hi,\n\nThanks for reaching out about:\n"${item.message}"\n\n`)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError('Both subject and message are required.')
      return
    }
    setSending(true)
    setError('')
    const res = await fetch(`/api/admin/feedback/${item.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    })
    if (res.ok) {
      setSent(true)
      onSent()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to send reply.')
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reply to Feedback</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.userEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Reply sent!</p>
            <p className="text-sm text-gray-500 mt-1">Your reply was delivered to {item.userEmail}.</p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={9}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
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
  const [replyTarget, setReplyTarget] = useState<FeedbackItem | null>(null)

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
      {replyTarget && (
        <ReplyModal
          item={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSent={() => {
            setItems(prev => prev.map(i => i.id === replyTarget.id ? { ...i, replyCount: i.replyCount + 1 } : i))
          }}
        />
      )}

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
                    {item.replyCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                        <CornerDownRight size={10} />
                        Replied{item.replyCount > 1 ? ` ×${item.replyCount}` : ''}
                      </span>
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
                  {item.userEmail && (
                    <button
                      onClick={() => setReplyTarget(item)}
                      title="Reply to this feedback"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      <Reply size={12} />
                      Reply
                    </button>
                  )}
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
