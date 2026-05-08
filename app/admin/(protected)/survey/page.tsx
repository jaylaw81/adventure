'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, X, MessageSquareHeart, Download, ChevronDown, ChevronUp, XCircle, Reply, Send, Loader2 } from 'lucide-react'

interface SurveyResponse {
  id: string
  userEmail: string | null
  likes: string | null
  dislikes: string | null
  featureRequests: string | null
  surveyType: string
  createdAt: string
}

function ReplyModal({ response, onClose }: { response: SurveyResponse; onClose: () => void }) {
  const [subject, setSubject] = useState('Re: Your StoryQuestor feedback')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSend = useCallback(async () => {
    if (!message.trim() || !subject.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/admin/survey/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: response.id, subject, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setTimeout(onClose, 1500)
    } catch {
      setStatus('error')
    }
  }, [response.id, subject, message, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Reply size={16} className="text-slate-500" />
            <span className="font-semibold text-slate-900 text-sm">Reply to {response.userEmail}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={7}
              placeholder="Write your reply…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              autoFocus
            />
          </div>

          {/* Original feedback summary */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1.5 border border-slate-100">
            <p className="font-semibold text-slate-600 mb-1">Original feedback</p>
            {response.likes && <p><span className="font-medium text-slate-700">Likes:</span> {response.likes}</p>}
            {response.dislikes && <p><span className="font-medium text-slate-700">Dislikes:</span> {response.dislikes}</p>}
            {response.featureRequests && <p><span className="font-medium text-slate-700">Features:</span> {response.featureRequests}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pb-5 gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || !subject.trim() || status === 'sending' || status === 'sent'}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            {status === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {status === 'sent' ? 'Sent!' : status === 'sending' ? 'Sending…' : 'Send Reply'}
          </button>
        </div>

        {status === 'error' && (
          <p className="px-6 pb-4 text-xs text-red-500">Failed to send — check your Resend config and try again.</p>
        )}
      </div>
    </div>
  )
}

function ExpandableCell({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return <span className="text-slate-300">—</span>
  const isLong = text.length > 80
  return (
    <div>
      <p className={`text-slate-700 text-xs leading-relaxed whitespace-pre-wrap ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1 flex items-center gap-0.5 text-xs text-amber-600 hover:text-amber-700 font-medium"
        >
          {expanded ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> More</>}
        </button>
      )}
    </div>
  )
}

export default function SurveyAdminPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [dismissalCount, setDismissalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'initial' | 'followup'>('all')
  const [replyTarget, setReplyTarget] = useState<SurveyResponse | null>(null)

  useEffect(() => {
    fetch('/api/admin/survey')
      .then(r => r.json())
      .then(data => {
        setResponses(data.responses)
        setDismissalCount(data.dismissalCount)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let list = responses
    if (typeFilter !== 'all') list = list.filter(r => r.surveyType === typeFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(r =>
        (r.userEmail ?? '').toLowerCase().includes(q) ||
        (r.likes ?? '').toLowerCase().includes(q) ||
        (r.dislikes ?? '').toLowerCase().includes(q) ||
        (r.featureRequests ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [responses, search, typeFilter])

  const stats = useMemo(() => ({
    total: responses.length,
    initial: responses.filter(r => r.surveyType === 'initial').length,
    followup: responses.filter(r => r.surveyType === 'followup').length,
    withFeatureRequests: responses.filter(r => r.featureRequests).length,
  }), [responses])

  function exportCsv() {
    const header = 'Email,Type,Likes,Dislikes,Feature Requests,Submitted'
    const rows = responses.map(r =>
      [
        r.userEmail ?? '',
        r.surveyType,
        r.likes ?? '',
        r.dislikes ?? '',
        r.featureRequests ?? '',
        new Date(r.createdAt).toLocaleDateString(),
      ]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survey-responses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Survey Responses</h1>
          <p className="text-slate-500 text-sm mt-1">User feedback collected from the in-app survey</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={responses.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Responses', value: stats.total, color: 'bg-amber-100 text-amber-600', icon: <MessageSquareHeart size={18} /> },
          { label: 'Initial Surveys', value: stats.initial, color: 'bg-blue-100 text-blue-600', icon: <MessageSquareHeart size={18} /> },
          { label: 'Follow-up Surveys', value: stats.followup, color: 'bg-purple-100 text-purple-600', icon: <MessageSquareHeart size={18} /> },
          { label: 'Feature Requests', value: stats.withFeatureRequests, color: 'bg-green-100 text-green-600', icon: <MessageSquareHeart size={18} /> },
          { label: 'Closed Without Filling', value: dismissalCount, color: 'bg-red-100 text-red-500', icon: <XCircle size={18} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or response content…"
            className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
          {(['all', 'initial', 'followup'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                typeFilter === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All' : t === 'initial' ? 'Initial' : 'Follow-up'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {responses.length === 0 ? 'No survey responses yet.' : 'No results match your filters.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold w-1/4">Likes</th>
                <th className="text-left px-4 py-3 font-semibold w-1/4">Dislikes</th>
                <th className="text-left px-4 py-3 font-semibold w-1/4">Feature Requests</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {r.userEmail ? (
                      <a href={`mailto:${r.userEmail}`} className="hover:text-amber-600 transition-colors">
                        {r.userEmail}
                      </a>
                    ) : (
                      <span className="text-slate-300">anonymous</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.surveyType === 'followup'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {r.surveyType === 'followup' ? 'Follow-up' : 'Initial'}
                    </span>
                  </td>
                  <td className="px-4 py-4"><ExpandableCell text={r.likes} /></td>
                  <td className="px-4 py-4"><ExpandableCell text={r.dislikes} /></td>
                  <td className="px-4 py-4"><ExpandableCell text={r.featureRequests} /></td>
                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-4">
                    {r.userEmail && (
                      <button
                        onClick={() => setReplyTarget(r)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                      >
                        <Reply size={12} />
                        Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          {filtered.length} of {responses.length} responses
        </p>
      )}

      {replyTarget && (
        <ReplyModal response={replyTarget} onClose={() => setReplyTarget(null)} />
      )}
    </div>
  )
}
