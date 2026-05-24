'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Search, X, MessageSquareHeart, Download, ChevronDown, ChevronUp,
  XCircle, Reply, Send, Loader2, MessagesSquare, Clock,
  BarChart2, Star, Users, CheckCircle, TrendingUp,
} from 'lucide-react'
import { SURVEYS } from '@/lib/surveys'

/* ══════════════════════════════════════════════════════════════
   LEGACY SURVEY TYPES & COMPONENTS
   ══════════════════════════════════════════════════════════════ */

interface SurveyReply {
  id: string; surveyResponseId: string; sentByEmail: string
  subject: string; message: string; sentAt: string
}
interface LegacyResponse {
  id: string; userEmail: string | null; likes: string | null
  dislikes: string | null; featureRequests: string | null
  surveyType: string; createdAt: string; replies: SurveyReply[]
}

function ReplyModal({ response, onClose, onSent }: {
  response: LegacyResponse; onClose: () => void; onSent: (r: SurveyReply) => void
}) {
  const [subject, setSubject] = useState('Re: Your StoryQuestor feedback')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSend = useCallback(async () => {
    if (!message.trim() || !subject.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/admin/survey/reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: response.id, subject, message }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStatus('sent'); onSent(data.reply); setTimeout(onClose, 1200)
    } catch { setStatus('error') }
  }, [response.id, subject, message, onClose, onSent])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <Reply size={16} className="text-slate-500" />
            <span className="font-semibold text-slate-900 text-sm">Reply to {response.userEmail}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-4">
          {response.replies.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">History ({response.replies.length})</p>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {response.replies.map(r => (
                  <div key={r.id} className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-xs">
                    <div className="flex items-center justify-between mb-1"><span className="font-semibold text-violet-700">{r.sentByEmail}</span><span className="text-slate-400">{new Date(r.sentAt).toLocaleDateString()}</span></div>
                    <p className="font-medium text-slate-600 mb-0.5">{r.subject}</p>
                    <p className="text-slate-500 whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Write your reply…" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" autoFocus />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1 border border-slate-100">
            <p className="font-semibold text-slate-600 mb-1">Original feedback</p>
            {response.likes && <p><span className="font-medium text-slate-700">Likes:</span> {response.likes}</p>}
            {response.dislikes && <p><span className="font-medium text-slate-700">Dislikes:</span> {response.dislikes}</p>}
            {response.featureRequests && <p><span className="font-medium text-slate-700">Features:</span> {response.featureRequests}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between px-6 pb-5 pt-3 gap-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSend} disabled={!message.trim() || !subject.trim() || status === 'sending' || status === 'sent'} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            {status === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {status === 'sent' ? 'Sent!' : status === 'sending' ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
        {status === 'error' && <p className="px-6 pb-4 text-xs text-red-500">Failed to send. Check Resend config.</p>}
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
      <p className={`text-slate-700 text-xs leading-relaxed whitespace-pre-wrap ${!expanded && isLong ? 'line-clamp-2' : ''}`}>{text}</p>
      {isLong && (
        <button onClick={() => setExpanded(v => !v)} className="mt-1 flex items-center gap-0.5 text-xs text-amber-600 hover:text-amber-700 font-medium">
          {expanded ? <><ChevronUp size={11} />Less</> : <><ChevronDown size={11} />More</>}
        </button>
      )}
    </div>
  )
}

function LegacyTab() {
  const [responses, setResponses] = useState<LegacyResponse[]>([])
  const [dismissalCount, setDismissalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'initial' | 'followup'>('all')
  const [replyTarget, setReplyTarget] = useState<LegacyResponse | null>(null)

  useEffect(() => {
    fetch('/api/admin/survey').then(r => r.json()).then(data => {
      setResponses(data.responses); setDismissalCount(data.dismissalCount); setLoading(false)
    })
  }, [])

  const handleReplySent = useCallback((responseId: string, reply: SurveyReply) => {
    setResponses(prev => prev.map(r => r.id === responseId ? { ...r, replies: [...r.replies, reply] } : r))
    setReplyTarget(prev => prev?.id === responseId ? { ...prev, replies: [...prev.replies, reply] } : prev)
  }, [])

  const filtered = useMemo(() => {
    let list = typeFilter !== 'all' ? responses.filter(r => r.surveyType === typeFilter) : responses
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(r =>
      (r.userEmail ?? '').toLowerCase().includes(q) ||
      (r.likes ?? '').toLowerCase().includes(q) ||
      (r.dislikes ?? '').toLowerCase().includes(q) ||
      (r.featureRequests ?? '').toLowerCase().includes(q)
    )
    return list
  }, [responses, search, typeFilter])

  const stats = useMemo(() => ({
    total: responses.length,
    initial: responses.filter(r => r.surveyType === 'initial').length,
    followup: responses.filter(r => r.surveyType === 'followup').length,
    withFeatureRequests: responses.filter(r => r.featureRequests).length,
  }), [responses])

  function exportCsv() {
    const rows = responses.map(r =>
      [r.userEmail ?? '', r.surveyType, r.likes ?? '', r.dislikes ?? '', r.featureRequests ?? '', new Date(r.createdAt).toLocaleDateString(), r.replies.length]
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )
    const csv = ['Email,Type,Likes,Dislikes,Feature Requests,Submitted,Replies', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: `legacy-survey-${new Date().toISOString().slice(0, 10)}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <p className="text-sm text-slate-500">Open-ended feedback collected from the original survey format</p>
        <button onClick={exportCsv} disabled={responses.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm">
          <Download size={14} />Export CSV
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-amber-100 text-amber-600' },
          { label: 'Initial', value: stats.initial, color: 'bg-blue-100 text-blue-600' },
          { label: 'Follow-up', value: stats.followup, color: 'bg-purple-100 text-purple-600' },
          { label: 'Feature Requests', value: stats.withFeatureRequests, color: 'bg-green-100 text-green-600' },
          { label: 'Dismissed', value: dismissalCount, color: 'bg-red-100 text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-2 h-8 rounded-full ${color.split(' ')[0]}`} />
            <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or content…" className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
          {(['all', 'initial', 'followup'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${typeFilter === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {t === 'all' ? 'All' : t === 'initial' ? 'Initial' : 'Follow-up'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">{responses.length === 0 ? 'No responses yet.' : 'No results.'}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold w-1/5">Likes</th>
                <th className="text-left px-4 py-3 font-semibold w-1/5">Dislikes</th>
                <th className="text-left px-4 py-3 font-semibold w-1/5">Features</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors align-top">
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {r.userEmail ? (
                      <div>
                        <a href={`mailto:${r.userEmail}`} className="font-mono hover:text-amber-600 transition-colors">{r.userEmail}</a>
                        {r.replies.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-violet-600 text-xs">
                            <MessagesSquare size={10} /><span>{r.replies.length} {r.replies.length === 1 ? 'reply' : 'replies'}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono">anonymous</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.surveyType === 'followup' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.surveyType === 'followup' ? 'Follow-up' : 'Initial'}
                    </span>
                  </td>
                  <td className="px-4 py-4"><ExpandableCell text={r.likes} /></td>
                  <td className="px-4 py-4"><ExpandableCell text={r.dislikes} /></td>
                  <td className="px-4 py-4"><ExpandableCell text={r.featureRequests} /></td>
                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-4">
                    {r.userEmail && (
                      <button onClick={() => setReplyTarget(r)} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${r.replies.length > 0 ? 'text-violet-800 bg-violet-100 hover:bg-violet-200' : 'text-violet-700 bg-violet-50 hover:bg-violet-100'}`}>
                        <Reply size={12} />{r.replies.length > 0 ? `Reply (${r.replies.length})` : 'Reply'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && <p className="text-xs text-slate-400 mt-3 text-right">{filtered.length} of {responses.length} responses</p>}
      {replyTarget && <ReplyModal response={replyTarget} onClose={() => setReplyTarget(null)} onSent={r => handleReplySent(replyTarget.id, r)} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STRUCTURED SURVEY ANALYTICS
   ══════════════════════════════════════════════════════════════ */

interface QuestionStat {
  key: string; text: string; type: string; options?: string[]
  answers: string[]
  avg?: number | null
  score?: number | null
  promoters?: number; passives?: number; detractors?: number
  dist?: Record<string, number>
}
interface SurveyAnalytics {
  slug: string; title: string
  shown: number; completed: number; dismissed: number; completionRate: number
  questionStats: QuestionStat[]
  weeks: { label: string; count: number }[]
}

function StatPill({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-0.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

function DistBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-36 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{pct}%</span>
      <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
    </div>
  )
}

function StarsChart({ stat }: { stat: QuestionStat }) {
  const total = stat.answers.length
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} size={18} fill={(stat.avg ?? 0) >= n ? '#f59e0b' : 'none'} stroke={(stat.avg ?? 0) >= n ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5} />
          ))}
        </div>
        <span className="text-2xl font-bold text-slate-900">{stat.avg !== null && stat.avg !== undefined ? stat.avg.toFixed(1) : '—'}</span>
        <span className="text-sm text-slate-400">/ 5 · {total} responses</span>
      </div>
      <div className="flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map(n => (
          <DistBar key={n} label={`${n} star${n !== 1 ? 's' : ''}`} count={stat.dist?.[String(n)] ?? 0} total={total}
            color={n >= 4 ? '#22c55e' : n === 3 ? '#f59e0b' : '#ef4444'} />
        ))}
      </div>
    </div>
  )
}

function NpsChart({ stat }: { stat: QuestionStat }) {
  const total = stat.answers.length
  const p = stat.promoters ?? 0
  const pa = stat.passives ?? 0
  const d = stat.detractors ?? 0
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div>
          <p className="text-4xl font-bold" style={{ color: (stat.score ?? 0) >= 50 ? '#16a34a' : (stat.score ?? 0) >= 0 ? '#d97706' : '#dc2626' }}>
            {stat.score !== null && stat.score !== undefined ? (stat.score > 0 ? `+${stat.score}` : stat.score) : '—'}
          </p>
          <p className="text-xs text-slate-500">NPS score</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center"><p className="text-lg font-bold text-emerald-600">{p}</p><p className="text-xs text-slate-500">Promoters<br/>(9-10)</p></div>
          <div className="text-center"><p className="text-lg font-bold text-amber-600">{pa}</p><p className="text-xs text-slate-500">Passives<br/>(7-8)</p></div>
          <div className="text-center"><p className="text-lg font-bold text-red-600">{d}</p><p className="text-xs text-slate-500">Detractors<br/>(0-6)</p></div>
        </div>
      </div>
      {total > 0 && (
        <div className="flex rounded-full overflow-hidden h-3 mb-4">
          <div style={{ width: `${Math.round((p / total) * 100)}%`, background: '#22c55e' }} />
          <div style={{ width: `${Math.round((pa / total) * 100)}%`, background: '#f59e0b' }} />
          <div style={{ width: `${Math.round((d / total) * 100)}%`, background: '#ef4444' }} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 11 }, (_, i) => (
          <DistBar key={i} label={`Score ${i}`} count={stat.dist?.[String(i)] ?? 0} total={total}
            color={i >= 9 ? '#22c55e' : i >= 7 ? '#f59e0b' : '#ef4444'} />
        ))}
      </div>
    </div>
  )
}

function ChoiceChart({ stat }: { stat: QuestionStat }) {
  const total = stat.answers.length
  const options = stat.type === 'yes_no_maybe' ? ['yes', 'maybe', 'no'] : (stat.options ?? [])
  const colors: Record<string, string> = {
    yes: '#22c55e', maybe: '#f59e0b', no: '#ef4444',
  }
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt, i) => (
        <DistBar
          key={opt}
          label={opt}
          count={stat.dist?.[opt] ?? 0}
          total={total}
          color={colors[opt] ?? ['#7c3aed', '#a78bfa', '#6d28d9', '#8b5cf6', '#c4b5fd', '#ddd6fe'][i % 6]}
        />
      ))}
      <p className="text-xs text-slate-400 mt-1">{total} responses</p>
    </div>
  )
}

function TextAnswers({ stat }: { stat: QuestionStat }) {
  const [search, setSearch] = useState('')
  const filtered = stat.answers.filter(a => a.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">{stat.answers.length} responses</p>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter…" className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400" />
        </div>
      </div>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No responses{search ? ' matching filter' : ''}</p>
        ) : filtered.map((a, i) => (
          <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {a}
          </div>
        ))}
      </div>
    </div>
  )
}

function WeeklyChart({ weeks }: { weeks: { label: string; count: number }[] }) {
  const max = Math.max(...weeks.map(w => w.count), 1)
  return (
    <div>
      <div className="flex items-end gap-1 h-24">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {w.count}
            </div>
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${Math.max((w.count / max) * 80, w.count > 0 ? 4 : 2)}px`,
                background: w.count > 0 ? 'linear-gradient(to top, #7c3aed, #a78bfa)' : '#e2e8f0',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 text-center">
            {i % 3 === 0 && <span className="text-[9px] text-slate-400">{w.label}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function StructuredSurveyTab({ data }: { data: SurveyAnalytics }) {
  return (
    <div>
      {/* Overview stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatPill label="Times Shown" value={data.shown} />
        <StatPill label="Completed" value={data.completed} sub={`${data.completionRate}% completion rate`} />
        <StatPill label="Dismissed" value={data.dismissed} />
        <StatPill label="Completion Rate" value={`${data.completionRate}%`} />
      </div>

      {/* Weekly trend */}
      {data.completed > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-slate-900">Completions (last 12 weeks)</h3>
          </div>
          <WeeklyChart weeks={data.weeks} />
        </div>
      )}

      {/* Per-question results */}
      <div className="flex flex-col gap-5">
        {data.questionStats.map((q, i) => (
          <div key={q.key} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-xs font-bold text-violet-400 mt-0.5 shrink-0">Q{i + 1}</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">{q.text}</h3>
                <span className="text-xs text-slate-400 capitalize">{q.type.replace(/_/g, ' ')}</span>
              </div>
            </div>
            {q.answers.length === 0 ? (
              <p className="text-xs text-slate-400">No responses yet</p>
            ) : q.type === 'stars' ? (
              <StarsChart stat={q} />
            ) : q.type === 'nps' ? (
              <NpsChart stat={q} />
            ) : (q.type === 'multiple_choice' || q.type === 'yes_no_maybe') ? (
              <ChoiceChart stat={q} />
            ) : (
              <TextAnswers stat={q} />
            )}
          </div>
        ))}
      </div>

      {data.completed === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          No completions yet. The survey will show to users after 10 minutes of usage.
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */

type Tab = 'legacy' | string

export default function SurveyAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('happiness')
  const [analyticsData, setAnalyticsData] = useState<SurveyAnalytics[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/survey/v2')
      .then(r => r.json())
      .then(data => { setAnalyticsData(data); setAnalyticsLoading(false) })
  }, [])

  const tabs = [
    ...SURVEYS.map(s => ({ id: s.slug, label: s.title })),
    { id: 'legacy', label: 'Legacy Feedback' },
  ]

  const currentData = analyticsData.find(d => d.slug === activeTab)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Surveys</h1>
        <p className="text-slate-500 text-sm mt-1">Response analytics and user feedback</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-8">
        {tabs.map(tab => {
          const analytics = analyticsData.find(d => d.slug === tab.id)
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                isActive
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.id !== 'legacy' && analytics && analytics.completed > 0 && (
                <span className="text-xs bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 font-semibold">
                  {analytics.completed}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'legacy' ? (
        <LegacyTab />
      ) : analyticsLoading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading analytics…</div>
      ) : currentData ? (
        <StructuredSurveyTab data={currentData} />
      ) : null}
    </div>
  )
}
