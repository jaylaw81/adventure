'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, X, School, Download, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

const ROLE_LABEL: Record<string, string> = {
  teacher: 'Teacher',
  administrator: 'Administrator',
  librarian: 'Librarian',
  other: 'Other',
}

const ROLE_COLOR: Record<string, string> = {
  teacher: 'bg-blue-100 text-blue-700',
  administrator: 'bg-purple-100 text-purple-700',
  librarian: 'bg-green-100 text-green-700',
  other: 'bg-slate-100 text-slate-600',
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  denied:   { label: 'Denied',   color: 'bg-red-100 text-red-600',      icon: XCircle },
}

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  school: string | null
  role: string | null
  status: string
  inviteSentAt: string | null
  createdAt: string
}

type ActionState = 'idle' | 'loading' | 'done' | 'error'

function ActionButtons({ entry, onUpdated }: { entry: WaitlistEntry; onUpdated: (id: string, status: 'accepted' | 'denied') => void }) {
  const [acceptState, setAcceptState] = useState<ActionState>('idle')
  const [denyState, setDenyState] = useState<ActionState>('idle')

  const act = useCallback(async (action: 'accept' | 'deny') => {
    const setState = action === 'accept' ? setAcceptState : setDenyState
    setState('loading')
    try {
      const res = await fetch(`/api/admin/waitlist/${entry.id}/${action}`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Action failed')
        setState('idle')
        return
      }
      setState('done')
      onUpdated(entry.id, action === 'accept' ? 'accepted' : 'denied')
    } catch {
      setState('error')
    }
  }, [entry.id, onUpdated])

  if (entry.status !== 'pending') return null

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => act('accept')}
        disabled={acceptState === 'loading' || denyState === 'loading'}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
      >
        {acceptState === 'loading' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
        Accept
      </button>
      <button
        onClick={() => act('deny')}
        disabled={acceptState === 'loading' || denyState === 'loading'}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        {denyState === 'loading' ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
        Deny
      </button>
    </div>
  )
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'denied'>('all')

  useEffect(() => {
    fetch('/api/admin/waitlist')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
  }, [])

  const handleUpdated = useCallback((id: string, status: 'accepted' | 'denied') => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status, inviteSentAt: status === 'accepted' ? new Date().toISOString() : e.inviteSentAt } : e))
  }, [])

  const filtered = useMemo(() => {
    let list = entries
    if (statusFilter !== 'all') list = list.filter(e => e.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(e =>
        e.email.toLowerCase().includes(q) ||
        (e.name ?? '').toLowerCase().includes(q) ||
        (e.school ?? '').toLowerCase().includes(q) ||
        (e.role ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, search, statusFilter])

  const stats = useMemo(() => ({
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    accepted: entries.filter(e => e.status === 'accepted').length,
    denied: entries.filter(e => e.status === 'denied').length,
  }), [entries])

  function exportCsv() {
    const header = 'Name,Email,School / Organization,Role,Status,Signed Up'
    const rows = entries.map(e =>
      [
        e.name ?? '',
        e.email,
        e.school ?? '',
        e.role ? (ROLE_LABEL[e.role] ?? e.role) : '',
        e.status,
        new Date(e.createdAt).toLocaleDateString(),
      ]
        .map(v => `"${v.replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `org-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Waitlist</h1>
          <p className="text-slate-500 text-sm mt-1">Educators and schools interested in the Organization tier</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={entries.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sign-ups', value: stats.total,    icon: School,       color: 'bg-amber-100 text-amber-600' },
          { label: 'Pending',        value: stats.pending,  icon: Clock,        color: 'bg-amber-100 text-amber-600' },
          { label: 'Accepted',       value: stats.accepted, icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
          { label: 'Denied',         value: stats.denied,   icon: XCircle,      color: 'bg-red-100 text-red-500'    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color}`}><Icon size={18} /></div>
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
            placeholder="Search by name, email, school, or role…"
            className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
          {(['all', 'pending', 'accepted', 'denied'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
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
            {entries.length === 0 ? 'No waitlist sign-ups yet.' : 'No results match your filters.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">School / Organization</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Signed Up</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(entry => {
                const cfg = STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                const StatusIcon = cfg.icon
                return (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors align-middle">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {entry.name ?? <span className="text-slate-400 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">
                      <a href={`mailto:${entry.email}`} className="hover:text-violet-600 transition-colors">
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {entry.school ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {entry.role ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[entry.role] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ROLE_LABEL[entry.role] ?? entry.role}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                      {entry.status === 'accepted' && entry.inviteSentAt && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sent {new Date(entry.inviteSentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionButtons entry={entry} onUpdated={handleUpdated} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          {filtered.length} of {entries.length} entries
        </p>
      )}
    </div>
  )
}
