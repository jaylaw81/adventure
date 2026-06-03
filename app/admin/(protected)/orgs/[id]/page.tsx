'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ShieldOff, ShieldCheck, UserMinus, UserPlus,
  Building2, Calendar, Globe, Users, Copy, Check, X,
} from 'lucide-react'

interface Member {
  id: string
  userEmail: string
  displayName: string | null
  role: string
  roleScope: string
  status: string
  joinedAt: string
}

interface OrgDetail {
  id: string
  name: string
  adminEmail: string
  adminName: string | null
  description: string | null
  privacyLevel: string
  status: string
  createdAt: string
  updatedAt: string
  members: Member[]
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  reviewer: 'Reviewer',
  member: 'Member',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
  reviewer: 'bg-teal-100 text-teal-700',
  member: 'bg-slate-100 text-slate-600',
}

export default function AdminOrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [org, setOrg] = useState<OrgDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orgs/${id}`)
      .then(r => r.json())
      .then(data => { setOrg(data); setLoading(false) })
  }, [id])

  async function toggleSuspend() {
    if (!org) return
    setActing(true)
    const action = org.status === 'suspended' ? 'unsuspend' : 'suspend'
    const res = await fetch(`/api/admin/orgs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrg(prev => prev ? { ...prev, status: updated.status } : prev)
    }
    setActing(false)
  }

  async function removeMember(email: string) {
    if (!confirm(`Remove ${email} from this organization?`)) return
    setRemovingEmail(email)
    const res = await fetch(`/api/admin/orgs/${id}/members/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setOrg(prev => prev
        ? { ...prev, members: prev.members.filter(m => m.userEmail !== email) }
        : prev
      )
    }
    setRemovingEmail(null)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError('')
    setInviteLink('')
    setInviting(true)
    const res = await fetch(`/api/admin/orgs/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    if (!res.ok) {
      setInviteError(data.error ?? 'Failed to create invite')
    } else {
      setInviteLink(data.inviteUrl)
      setInviteEmail('')
      setInviteRole('member')
    }
    setInviting(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
    )
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">Organization not found.</div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/orgs')}
          className="mt-0.5 p-2 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
          title="Back to organizations"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{org.name}</h1>
            {org.status === 'suspended' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 shrink-0">
                <ShieldOff size={12} /> Suspended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0">
                <ShieldCheck size={12} /> Active
              </span>
            )}
          </div>
          {org.description && (
            <p className="text-slate-500 text-sm mt-1">{org.description}</p>
          )}
        </div>
        <button
          onClick={toggleSuspend}
          disabled={acting}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${
            org.status === 'suspended'
              ? 'bg-green-100 hover:bg-green-200 text-green-700'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
          }`}
        >
          {org.status === 'suspended'
            ? <><ShieldCheck size={15} /> Unsuspend Org</>
            : <><ShieldOff size={15} /> Suspend Org</>
          }
        </button>
      </div>

      {/* Org meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Building2, label: 'Admin', value: org.adminName || org.adminEmail, sub: org.adminName ? org.adminEmail : undefined },
          { icon: Users, label: 'Members', value: String(org.members.length) },
          { icon: Globe, label: 'Privacy', value: org.privacyLevel },
          { icon: Calendar, label: 'Created', value: new Date(org.createdAt).toLocaleDateString() },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">
              <Icon size={13} />{label}
            </div>
            <p className="text-slate-900 font-semibold text-sm truncate">{value}</p>
            {sub && <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members table */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            Members
            <span className="ml-1 text-xs font-normal text-slate-400">({org.members.length})</span>
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {org.members.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No members yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-3 font-semibold">Member</th>
                      <th className="text-left px-4 py-3 font-semibold">Role</th>
                      <th className="text-left px-4 py-3 font-semibold">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {org.members.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{member.displayName || '(no name)'}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{member.userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role] ?? 'bg-slate-100 text-slate-600'}`}>
                            {ROLE_LABELS[member.role] ?? member.role}
                          </span>
                          {member.role !== 'admin' && member.role !== 'member' && member.roleScope === 'groups' && (
                            <span className="ml-1 text-xs text-slate-400">(groups only)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {member.role !== 'admin' && (
                            <button
                              onClick={() => removeMember(member.userEmail)}
                              disabled={removingEmail === member.userEmail}
                              title="Remove from org"
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <UserMinus size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Invite form */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <UserPlus size={16} className="text-slate-400" />
            Invite Member
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="member@school.edu"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                >
                  <option value="member">Member</option>
                  <option value="teacher">Teacher</option>
                  <option value="reviewer">Reviewer</option>
                </select>
              </div>
              {inviteError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{inviteError}</p>
              )}
              <button
                type="submit"
                disabled={inviting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
              >
                <UserPlus size={15} />
                {inviting ? 'Creating invite…' : 'Create Invite Link'}
              </button>
            </form>

            {inviteLink && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium mb-2">Invite link created — share with the member:</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-green-800 font-mono flex-1 truncate">{inviteLink}</p>
                  <button
                    onClick={copyLink}
                    className="shrink-0 p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={() => setInviteLink('')}
                    className="shrink-0 p-1.5 text-green-600 hover:text-green-800 transition-colors"
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
