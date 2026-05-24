'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, ShieldOff, Trash2, ChevronRight, UserCheck, UserX } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  displayName: string
  tier: string
  status: string
  createdAt: string
  storyCount: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    )
  }, [users, search])

  const stats = useMemo(() => ({
    total: users.length,
    suspended: users.filter(u => u.status === 'suspended').length,
    org: users.filter(u => u.tier === 'organization').length,
  }), [users])

  async function toggleSuspend(user: AdminUser) {
    setActing(user.id)
    const action = user.status === 'suspended' ? 'unsuspend' : 'suspend'
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: updated.status } : u))
    }
    setActing(null)
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`Permanently delete ${user.email} and all their stories? This cannot be undone.`)) return
    setActing(user.id)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== user.id))
    setActing(null)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <p className="text-slate-500 text-sm">All registered accounts</p>
          <div className="w-px h-3.5 bg-slate-200 shrink-0" />
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.total}</span> total</span>
          <span className="text-sm text-slate-500"><span className="font-semibold text-red-600">{stats.suspended}</span> suspended</span>
          <span className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{stats.org}</span> org tier</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or display name…"
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
          <div className="p-12 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Tier</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Stories</th>
                <th className="text-left px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{user.displayName || '(no name)'}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.tier === 'organization'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {user.status === 'suspended' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <UserX size={11} /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <UserCheck size={11} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{user.storyCount}</td>
                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleSuspend(user)}
                        disabled={acting === user.id}
                        title={user.status === 'suspended' ? 'Unsuspend account' : 'Suspend account'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                          user.status === 'suspended'
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                        }`}
                      >
                        {user.status === 'suspended' ? <UserCheck size={14} /> : <ShieldOff size={14} />}
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={acting === user.id}
                        title="Delete account"
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        View <ChevronRight size={12} />
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
          {filtered.length} of {users.length} users
        </p>
      )}
    </div>
  )
}
