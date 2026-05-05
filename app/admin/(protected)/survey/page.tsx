'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, X, MessageSquareHeart, Download, ChevronDown, ChevronUp, XCircle } from 'lucide-react'

interface SurveyResponse {
  id: string
  userEmail: string | null
  likes: string | null
  dislikes: string | null
  featureRequests: string | null
  surveyType: string
  createdAt: string
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
    </div>
  )
}
