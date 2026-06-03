'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, ShieldOff, ShieldCheck, ChevronRight, Building2 } from 'lucide-react'

interface AdminOrg {
  id: string
  name: string
  adminEmail: string
  adminName: string | null
  description: string | null
  privacyLevel: string
  status: string
  createdAt: string
  memberCount: number
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/orgs')
      .then(r => r.json())
      .then(data => { setOrgs(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orgs
    return orgs.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.adminEmail.toLowerCase().includes(q) ||
      (o.adminName ?? '').toLowerCase().includes(q)
    )
  }, [orgs, search])

  const stats = useMemo(() => ({
    total: orgs.length,
    suspended: orgs.filter(o => o.status === 'suspended').length,
    members: orgs.reduce((sum, o) => sum + o.memberCount, 0),
  }), [orgs])

  async function toggleSuspend(org: AdminOrg) {
    setActing(org.id)
    const action = org.status === 'suspended' ? 'unsuspend' : 'suspend'
    const res = await fetch(`/api/admin/orgs/${org.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, status: updated.status } : o))
    }
    setActing(null)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <p className="text-slate-500 text-sm">All registered organizations</p>
          <div className="w-px h-3.5 bg-slate-200 shrink-0" />
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.total}</span> total</span>
          <span className="text-sm text-slate-500"><span className="font-semibold text-red-600">{stats.suspended}</span> suspended</span>
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.members}</span> total members</span>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by org name or admin email…"
          className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">No organizations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Organization</th>
                  <th className="text-left px-4 py-3 font-semibold">Admin</th>
                  <th className="text-left px-4 py-3 font-semibold">Members</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{org.name}</p>
                      {org.description && (
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{org.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-700 font-medium">{org.adminName || '(no name)'}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{org.adminEmail}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{org.memberCount}</td>
                    <td className="px-4 py-4">
                      {org.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <ShieldOff size={11} /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <ShieldCheck size={11} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleSuspend(org)}
                          disabled={acting === org.id}
                          title={org.status === 'suspended' ? 'Unsuspend org' : 'Suspend org'}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            org.status === 'suspended'
                              ? 'bg-green-100 hover:bg-green-200 text-green-700'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                          }`}
                        >
                          {org.status === 'suspended' ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                        </button>
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                        >
                          Manage <ChevronRight size={12} />
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
          {filtered.length} of {orgs.length} organizations
        </p>
      )}
    </div>
  )
}
