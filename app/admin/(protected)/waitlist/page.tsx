'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, X, School, Download } from 'lucide-react'

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

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  school: string | null
  role: string | null
  createdAt: string
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/waitlist')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(e =>
      e.email.toLowerCase().includes(q) ||
      (e.name ?? '').toLowerCase().includes(q) ||
      (e.school ?? '').toLowerCase().includes(q) ||
      (e.role ?? '').toLowerCase().includes(q)
    )
  }, [entries, search])

  function exportCsv() {
    const header = 'Name,Email,School / Organization,Role,Signed Up'
    const rows = entries.map(e =>
      [
        e.name ?? '',
        e.email,
        e.school ?? '',
        e.role ? (ROLE_LABEL[e.role] ?? e.role) : '',
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-2.5 bg-amber-100 rounded-lg">
            <School size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
            <p className="text-xs text-slate-500">Total Sign-ups</p>
          </div>
        </div>
        {(['teacher', 'administrator', 'librarian'] as const).map(role => (
          <div key={role} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLOR[role]}`}>
              {ROLE_LABEL[role]}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {entries.filter(e => e.role === role).length}
              </p>
              <p className="text-xs text-slate-500">{ROLE_LABEL[role]}s</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {entries.length === 0 ? 'No waitlist sign-ups yet.' : 'No results match your search.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">School / Organization</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Signed Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {entry.name ?? <span className="text-slate-400 font-normal">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">
                    <a href={`mailto:${entry.email}`} className="hover:text-amber-600 transition-colors">
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
                  <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
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
          {filtered.length} of {entries.length} entries
        </p>
      )}
    </div>
  )
}
