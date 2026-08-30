'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, X, ShieldOff, Trash2, ChevronRight, UserCheck, UserX,
  Clock, CheckCircle2, AlertTriangle, CreditCard, Building2, Gift,
  Eye, EyeOff, Network,
} from 'lucide-react'
import { formatCents } from '@/lib/pricing'

interface AdminUser {
  id: string
  email: string
  displayName: string
  tier: string
  status: string
  createdAt: string
  storyCount: number
  grandfathered: boolean
  subscriptionStatus: string | null
  subscriptionAmountCents: number | null
  subscriptionInterval: string | null
  profileVisible: boolean
  trialEndsAt: string | null
  gracePeriodEndsAt: string | null
  stripeCustomerId: string | null
  lastLoginAt: string | null
  signupIp: string | null
  sharedIpCount: number
}

// ── Billing classification ────────────────────────────────────────────────

type BillingCategory = 'active' | 'trial' | 'grace' | 'needs_setup' | 'issues' | 'org'

interface BillingInfo {
  category: BillingCategory
  label: string
  detail: string | null
  chipClass: string
  icon: React.ReactNode
}

function formatRelative(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 31) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null
  const ms = new Date(dateStr).getTime() - Date.now()
  if (ms <= 0) return null
  return Math.ceil(ms / 86_400_000)
}

function getBillingInfo(u: AdminUser): BillingInfo {
  if (u.tier === 'organization') {
    return {
      category: 'org',
      label: 'Organization',
      detail: null,
      chipClass: 'bg-amber-100 text-amber-700',
      icon: <Building2 size={11} />,
    }
  }

  if (u.grandfathered) {
    return {
      category: 'active',
      label: 'Grandfathered',
      detail: null,
      chipClass: 'bg-amber-100 text-amber-700',
      icon: <Gift size={11} />,
    }
  }

  if (u.subscriptionStatus === 'active') {
    const amt = u.subscriptionAmountCents
    return {
      category: 'active',
      label: 'Active',
      detail: amt ? `${formatCents(amt)}/${u.subscriptionInterval ?? 'month'}` : null,
      chipClass: 'bg-green-100 text-green-700',
      icon: <CheckCircle2 size={11} />,
    }
  }

  const trialDays = daysLeft(u.trialEndsAt)
  if (u.subscriptionStatus === 'trialing' || trialDays !== null) {
    const d = trialDays ?? 0
    return {
      category: 'trial',
      label: 'Trial',
      detail: `${d}d left`,
      chipClass: d <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700',
      icon: <Clock size={11} />,
    }
  }

  const graceDays = daysLeft(u.gracePeriodEndsAt)
  if (graceDays !== null) {
    return {
      category: 'grace',
      label: 'Grace period',
      detail: `${graceDays}d left`,
      chipClass: 'bg-orange-100 text-orange-700',
      icon: <AlertTriangle size={11} />,
    }
  }

  if (u.subscriptionStatus === 'past_due') {
    return {
      category: 'issues',
      label: 'Past due',
      detail: null,
      chipClass: 'bg-red-100 text-red-700',
      icon: <AlertTriangle size={11} />,
    }
  }

  if (u.subscriptionStatus === 'canceled' || u.subscriptionStatus === 'paused') {
    return {
      category: 'issues',
      label: u.subscriptionStatus === 'paused' ? 'Paused' : 'Canceled',
      detail: null,
      chipClass: 'bg-slate-100 text-slate-500',
      icon: <CreditCard size={11} />,
    }
  }

  // No billing configured at all
  return {
    category: 'needs_setup',
    label: 'Needs billing',
    detail: null,
    chipClass: 'bg-red-100 text-red-700',
    icon: <CreditCard size={11} />,
  }
}

// ── Filter tabs ───────────────────────────────────────────────────────────

type FilterKey = 'all' | BillingCategory

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'needs_setup', label: 'Needs setup' },
  { key: 'trial', label: 'In trial' },
  { key: 'grace', label: 'Grace period' },
  { key: 'active', label: 'Active' },
  { key: 'issues', label: 'Issues' },
  { key: 'org', label: 'Org' },
]

// ── Page ──────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
  }, [])

  const usersWithBilling = useMemo(
    () => users.map(u => ({ ...u, billing: getBillingInfo(u) })),
    [users]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: usersWithBilling.length }
    for (const u of usersWithBilling) {
      c[u.billing.category] = (c[u.billing.category] ?? 0) + 1
    }
    return c
  }, [usersWithBilling])

  const filtered = useMemo(() => {
    let list = usersWithBilling
    if (filter !== 'all') list = list.filter(u => u.billing.category === filter)
    if (flaggedOnly) list = list.filter(u => u.sharedIpCount > 1)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    )
    return list
  }, [usersWithBilling, filter, flaggedOnly, search])

  const stats = useMemo(() => ({
    total: users.length,
    suspended: users.filter(u => u.status === 'suspended').length,
    needsSetup: counts['needs_setup'] ?? 0,
    inTrial: counts['trial'] ?? 0,
    sharedIp: users.filter(u => u.sharedIpCount > 1).length,
  }), [users, counts])

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

  async function toggleProfileVisibility(user: AdminUser) {
    setActing(user.id)
    const action = user.profileVisible ? 'set_profile_private' : 'set_profile_public'
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, profileVisible: updated.profileVisible } : u))
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <p className="text-slate-500 text-sm">All registered accounts</p>
          <div className="w-px h-3.5 bg-slate-200 shrink-0" />
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{stats.total}</span> total
          </span>
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-red-600">{stats.suspended}</span> suspended
          </span>
          {stats.needsSetup > 0 && (
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-red-600">{stats.needsSetup}</span> need billing
            </span>
          )}
          {stats.inTrial > 0 && (
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-blue-600">{stats.inTrial}</span> in trial
            </span>
          )}
          {stats.sharedIp > 0 && (
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-orange-600">{stats.sharedIp}</span> shared-IP signups
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
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
        <button
          onClick={() => setFlaggedOnly(v => !v)}
          title="Show only accounts that share a signup IP with another account — a soft trial-abuse signal, not proof (shared wifi/offices produce it too)"
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
            flaggedOnly
              ? 'bg-orange-600 border-orange-600 text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Network size={13} /> Shared IP{stats.sharedIp > 0 ? ` (${stats.sharedIp})` : ''}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map(f => {
          const count = counts[f.key] ?? 0
          if (f.key !== 'all' && count === 0) return null
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {f.key === 'all' ? users.length : count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Billing</th>
                  <th className="text-left px-4 py-3 font-semibold">Account</th>
                  <th className="text-left px-4 py-3 font-semibold">Stories</th>
                  <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold">Last login</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => {
                  const billing = user.billing
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900 flex items-center gap-1.5">
                          {user.displayName || '(no name)'}
                          {user.sharedIpCount > 1 && (
                            <span
                              title={`${user.sharedIpCount} accounts share signup IP ${user.signupIp} — soft signal, not proof`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                            >
                              <Network size={10} /> {user.sharedIpCount}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                      </td>

                      {/* Billing */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${billing.chipClass}`}>
                          {billing.icon}
                          {billing.label}
                        </span>
                        {billing.detail && (
                          <p className={`text-xs mt-0.5 font-medium ${
                            billing.category === 'trial' && daysLeft(user.trialEndsAt) !== null && daysLeft(user.trialEndsAt)! <= 3
                              ? 'text-orange-600'
                              : billing.category === 'grace'
                              ? 'text-orange-600'
                              : 'text-slate-400'
                          }`}>
                            {billing.detail}
                          </p>
                        )}
                      </td>

                      {/* Account status */}
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
                      <td className="px-4 py-4 text-xs whitespace-nowrap">
                        {user.lastLoginAt ? (
                          <span className="text-slate-500" title={new Date(user.lastLoginAt).toLocaleString()}>
                            {formatRelative(user.lastLoginAt)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => toggleProfileVisibility(user)}
                            disabled={acting === user.id}
                            title={user.profileVisible ? 'Make profile private' : 'Make profile public'}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors disabled:opacity-40"
                          >
                            {user.profileVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
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
                  )
                })}
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
