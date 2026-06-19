'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Copy, Check, Trash2, X, Loader2, Clock, UserX, UserCheck, ChevronDown, Settings2, BookOpen, Eye, Pencil, Ban, RotateCcw, Globe, Lock, Search, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import Link from 'next/link'

interface Group {
  id: string
  name: string
}

interface Member {
  id: string
  userEmail: string
  displayName: string | null
  role: string
  roleScope: string
  status: string
  consentStatus: string | null
  consentedAt: string | null
  groups: { id: string; name: string }[]
  joinedAt: string
  storyCount: number
}

interface Invite {
  id: string
  email: string
  status: string
  token: string
  role: string
  groupId: string | null
  groupName: string | null
  expiresAt: string
  createdAt: string
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : ''

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  member:   { label: 'Member',   className: 'bg-slate-100 text-slate-500' },
  teacher:  { label: 'Teacher',  className: 'bg-blue-50 text-blue-700' },
  reviewer: { label: 'Reviewer', className: 'bg-purple-50 text-purple-700' },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 transition-colors"
    >
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy link</>}
    </button>
  )
}

function GroupsCell({
  member,
  allGroups,
  onChanged,
}: {
  member: Member
  allGroups: Group[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const memberGroupIds = member.groups.map(g => g.id)
  const available = allGroups.filter(g => !memberGroupIds.includes(g.id))

  async function setGroups(newIds: string[]) {
    await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/groups`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupIds: newIds }),
    })
    onChanged()
  }

  async function addGroup(groupId: string) {
    setSaving(groupId)
    await setGroups([...memberGroupIds, groupId])
    setSaving(null)
    if (available.length <= 1) setOpen(false)
  }

  async function removeGroup(groupId: string) {
    setSaving(groupId)
    await setGroups(memberGroupIds.filter(id => id !== groupId))
    setSaving(null)
  }

  function handleOpenDropdown() {
    if (addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
    setOpen(v => !v)
  }

  if (allGroups.length === 0) {
    return <span className="text-slate-300 text-xs">No groups</span>
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1 items-center min-h-[22px]">
        {member.groups.map(g => (
          <span key={g.id} className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
            {g.name}
            <button
              onClick={() => removeGroup(g.id)}
              disabled={saving === g.id}
              className="ml-0.5 p-0.5 rounded-full text-amber-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {saving === g.id ? <Loader2 size={9} className="animate-spin" /> : <X size={9} />}
            </button>
          </span>
        ))}

        {available.length > 0 && (
          <button
            ref={addButtonRef}
            onClick={handleOpenDropdown}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors text-xs font-bold leading-none"
            title="Add to group"
          >
            +
          </button>
        )}

        {member.groups.length === 0 && available.length === 0 && (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
          className="bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-40 max-h-52 overflow-y-auto"
        >
          {available.map(g => (
            <button
              key={g.id}
              onClick={() => addGroup(g.id)}
              disabled={!!saving}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving === g.id
                ? <Loader2 size={12} className="animate-spin text-slate-400" />
                : <Plus size={12} className="text-slate-400" />}
              {g.name}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (role: string) => void
  disabled?: boolean
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none pl-2.5 pr-6 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer disabled:opacity-50"
      >
        <option value="member">Member</option>
        <option value="teacher">Teacher</option>
        <option value="reviewer">Reviewer</option>
      </select>
      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

function PermissionsModal({
  member,
  groups,
  onClose,
  onSaved,
}: {
  member: Member
  groups: Group[]
  onClose: () => void
  onSaved: () => void
}) {
  const [scope, setScope] = useState<'org' | 'groups'>(member.roleScope === 'groups' ? 'groups' : 'org')
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [loadingPerms, setLoadingPerms] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/permissions`)
      .then(r => r.json())
      .then((ids: string[]) => {
        setSelectedGroupIds(Array.isArray(ids) ? ids : [])
        setLoadingPerms(false)
      })
  }, [member.userEmail])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleScope: scope }),
    })
    await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupIds: scope === 'groups' ? selectedGroupIds : [] }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  function toggleGroup(id: string) {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(13,12,26,0.7)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)} Permissions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{member.displayName || member.userEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {loadingPerms ? (
            <div className="py-8 flex justify-center">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-600 mb-3">Scope</p>
              <div className="flex flex-col gap-2 mb-5">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${scope === 'org' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="scope" checked={scope === 'org'} onChange={() => setScope('org')} className="accent-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Org-wide</p>
                    <p className="text-xs text-slate-500">Can access all groups in the organization</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${scope === 'groups' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="scope" checked={scope === 'groups'} onChange={() => setScope('groups')} className="accent-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Specific groups</p>
                    <p className="text-xs text-slate-500">Limited to the groups selected below</p>
                  </div>
                </label>
              </div>

              {scope === 'groups' && (
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Groups</p>
                  {groups.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No groups exist yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-52 overflow-y-auto border border-slate-100 rounded-xl p-2">
                      {groups.map(g => (
                        <label key={g.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedGroupIds.includes(g.id)}
                            onChange={() => toggleGroup(g.id)}
                            className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                          />
                          <span className="text-sm text-slate-700">{g.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {scope === 'groups' && selectedGroupIds.length === 0 && groups.length > 0 && (
                    <p className="text-xs text-amber-600 mt-2">Select at least one group.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loadingPerms || (scope === 'groups' && selectedGroupIds.length === 0 && groups.length > 0)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

interface Story {
  id: string
  title: string
  description: string
  isPublic: boolean
  status: string
  audience: string
  createdAt: string
  updatedAt: string
}

function MemberStoriesDrawer({ member, onClose }: { member: Member; onClose: () => void }) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)

  const loadStories = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/stories`)
    const data = await res.json()
    setStories(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [member.userEmail])

  useEffect(() => { loadStories() }, [loadStories])

  async function handleSuspend(story: Story) {
    setActingId(story.id)
    await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/stories/${story.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: story.status === 'suspended' ? 'active' : 'suspended' }),
    })
    setActingId(null)
    await loadStories()
  }

  async function handleDelete(story: Story) {
    if (!confirm(`Permanently delete "${story.title}"? This cannot be undone.`)) return
    setActingId(story.id)
    await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/stories/${story.id}`, { method: 'DELETE' })
    setActingId(null)
    await loadStories()
  }

  async function handleSaveEdit(story: Story) {
    if (!editTitle.trim()) return
    setActingId(story.id)
    await fetch(`/api/org/members/${encodeURIComponent(member.userEmail)}/stories/${story.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, description: editDesc }),
    })
    setActingId(null)
    setEditingId(null)
    await loadStories()
  }

  function startEdit(story: Story) {
    setEditingId(story.id)
    setEditTitle(story.title)
    setEditDesc(story.description)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" style={{ backgroundColor: 'rgba(13,12,26,0.6)' }} onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              {(member.displayName || member.userEmail)[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{member.displayName || member.userEmail}</p>
              <p className="text-xs text-slate-400 font-mono">{member.userEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Subheader */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <BookOpen size={12} /> Stories
          </p>
        </div>

        {/* Story list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No stories yet.</p>
            </div>
          ) : (
            <div className="px-6 py-4 flex flex-col gap-3">
              {stories.map(story => {
                const suspended = story.status === 'suspended'
                const acting = actingId === story.id
                return (
                  <div
                    key={story.id}
                    className={`rounded-xl border p-4 transition-colors ${suspended ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'}`}
                  >
                    {editingId === story.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          placeholder="Story title"
                          maxLength={200}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <textarea
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="Description (optional)"
                          rows={2}
                          maxLength={1000}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleSaveEdit(story)}
                            disabled={acting || !editTitle.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
                          >
                            {acting ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${suspended ? 'text-red-800' : 'text-slate-900'}`}>{story.title}</p>
                            {story.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{story.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                            {suspended && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                <Ban size={9} /> Suspended
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${story.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {story.isPublic ? <Globe size={9} /> : <Lock size={9} />}
                              {story.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Updated {new Date(story.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                          <Link
                            href={`/play/${story.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <Eye size={11} /> View
                          </Link>
                          <button
                            onClick={() => startEdit(story)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleSuspend(story)}
                            disabled={acting}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              suspended
                                ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            }`}
                          >
                            {acting
                              ? <Loader2 size={11} className="animate-spin" />
                              : suspended ? <RotateCcw size={11} /> : <Ban size={11} />}
                            {suspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDelete(story)}
                            disabled={acting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                          >
                            {acting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [consentFormEnabled, setConsentFormEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newGroupId, setNewGroupId] = useState('')
  const [newRole, setNewRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [newInviteUrl, setNewInviteUrl] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [permsMember, setPermsMember] = useState<Member | null>(null)
  const [storiesMember, setStoriesMember] = useState<Member | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    const [mData, i, g] = await Promise.all([
      fetch('/api/org/members').then(r => r.json()),
      fetch('/api/org/invites').then(r => r.json()),
      fetch('/api/org/groups').then(r => r.json()),
    ])
    setMembers(Array.isArray(mData) ? mData : (mData.members ?? []))
    setConsentFormEnabled(mData.consentFormEnabled ?? false)
    setInvites(Array.isArray(i) ? i : [])
    setGroups(Array.isArray(g) ? g : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError('')
    setNewInviteUrl('')
    setInviting(true)
    const res = await fetch('/api/org/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, groupId: newGroupId || null, role: newRole }),
    })
    const data = await res.json()
    setInviting(false)
    if (!res.ok) { setInviteError(data.error ?? 'Something went wrong'); return }
    setNewEmail('')
    setNewGroupId('')
    setNewRole('member')
    setNewInviteUrl(data.inviteUrl)
    await load()
  }

  async function updateMember(email: string, patch: Record<string, unknown>) {
    setUpdating(email)
    await fetch(`/api/org/members/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    await load()
    setUpdating(null)
  }

  async function handleDeleteMember(email: string) {
    if (!confirm(`Remove ${email} from the organization? This cannot be undone.`)) return
    setUpdating(email)
    await fetch(`/api/org/members/${encodeURIComponent(email)}`, { method: 'DELETE' })
    await load()
    setUpdating(null)
  }

  async function handleRevokeInvite(token: string) {
    await fetch(`/api/org/invites/${token}`, { method: 'DELETE' })
    await load()
  }

  async function handleRoleChange(member: Member, role: string) {
    const patch: Record<string, unknown> = { role }
    if (role === 'member') patch.roleScope = 'org'
    await updateMember(member.userEmail, patch)
  }

  async function handleResetConsent(email: string) {
    setUpdating(email)
    await fetch(`/api/org/members/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetConsent: true }),
    })
    await load()
    setUpdating(null)
  }

  const pendingInvites = useMemo(() => invites.filter(i => i.status === 'pending'), [invites])
  const nonAdminMembers = useMemo(() => members.filter(m => m.role !== 'admin'), [members])
  const activeCount = useMemo(() => nonAdminMembers.filter(m => m.status === 'active').length, [nonAdminMembers])
  const inactiveCount = useMemo(() => nonAdminMembers.filter(m => m.status === 'inactive').length, [nonAdminMembers])

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(m =>
      m.userEmail.toLowerCase().includes(q) ||
      (m.displayName ?? '').toLowerCase().includes(q) ||
      m.groups.some(g => g.name.toLowerCase().includes(q))
    )
  }, [members, search])

  return (
    <div className="p-8">
      {permsMember && (
        <PermissionsModal
          member={permsMember}
          groups={groups}
          onClose={() => setPermsMember(null)}
          onSaved={load}
        />
      )}
      {storiesMember && (
        <MemberStoriesDrawer member={storiesMember} onClose={() => setStoriesMember(null)} />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Members</h1>
        <p className="text-slate-500 text-sm mt-1">
          {nonAdminMembers.length} member{nonAdminMembers.length !== 1 ? 's' : ''} &middot;{' '}
          {activeCount} active &middot; {inactiveCount} inactive &middot; {pendingInvites.length} pending
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Plus size={15} className="text-amber-500" /> Generate an invite link
        </h2>
        <form onSubmit={handleInvite} className="flex flex-wrap gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setInviteError('') }}
            placeholder="student@school.edu"
            required
            maxLength={254}
            className="flex-1 min-w-48 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="member">Member</option>
            <option value="teacher">Teacher</option>
            <option value="reviewer">Reviewer</option>
          </select>
          {groups.length > 0 && (
            <select
              value={newGroupId}
              onChange={e => setNewGroupId(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">No group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Generate link
          </button>
        </form>

        {inviteError && <p className="mt-2 text-xs text-red-500">{inviteError}</p>}

        {newInviteUrl && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="flex-1 text-xs font-mono text-green-800 truncate">{newInviteUrl}</p>
            <CopyButton text={newInviteUrl} />
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">Copy and share the link directly with the invitee. Expires in 30 days.</p>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock size={14} className="text-purple-500" />
            <h2 className="text-sm font-semibold text-slate-700">Pending invites ({pendingInvites.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Group</th>
                <th className="text-left px-4 py-3 font-semibold">Expires</th>
                <th className="text-left px-4 py-3 font-semibold">Invite link</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingInvites.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{inv.email}</td>
                  <td className="px-4 py-3.5">
                    {(() => {
                      const r = ROLE_LABELS[inv.role] ?? ROLE_LABELS.member
                      return (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.className}`}>
                          {r.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {inv.groupName ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5"><CopyButton text={`${SITE_URL}/org/invite/${inv.token}`} /></td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleRevokeInvite(inv.token)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Revoke"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Members table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-700 shrink-0">All members</h2>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or group…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No members yet. Generate an invite link above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold">Member</th>
                <th className="text-left px-4 py-3 font-semibold">Groups</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                {consentFormEnabled && <th className="text-left px-4 py-3 font-semibold">Consent</th>}
                <th className="text-left px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={consentFormEnabled ? 7 : 6} className="px-5 py-10 text-center text-sm text-slate-400">
                    No members match &ldquo;{search}&rdquo;
                  </td>
                </tr>
              )}
              {filteredMembers.map(m => {
                const isAdmin = m.role === 'admin'
                const isUpdating = updating === m.userEmail
                const hasPermissions = m.role === 'teacher' || m.role === 'reviewer'
                return (
                  <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${m.status === 'inactive' ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => !isAdmin && setStoriesMember(m)}
                        className={`text-left group ${!isAdmin ? 'cursor-pointer' : ''}`}
                      >
                        <p className={`font-medium ${!isAdmin ? 'text-amber-700 group-hover:underline' : 'text-slate-900'}`}>
                          {m.displayName || m.userEmail}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{m.userEmail}</p>
                        {isAdmin && (
                          <span className="mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            Admin
                          </span>
                        )}
                        {!isAdmin && (
                          <span className="text-xs text-slate-300 group-hover:text-amber-500 transition-colors flex items-center gap-0.5 mt-0.5">
                            <BookOpen size={10} /> {m.storyCount} {m.storyCount === 1 ? 'story' : 'stories'}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {isAdmin ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <GroupsCell member={m} allGroups={groups} onChanged={load} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isAdmin ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <RoleSelect
                            value={m.role}
                            onChange={role => handleRoleChange(m, role)}
                            disabled={isUpdating}
                          />
                          {hasPermissions && (
                            <button
                              onClick={() => setPermsMember(m)}
                              title="Configure permissions"
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Settings2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Active</span>
                      ) : (
                        <button
                          onClick={() => updateMember(m.userEmail, { status: m.status === 'active' ? 'inactive' : 'active' })}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                            m.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {isUpdating ? <Loader2 size={11} className="animate-spin" /> : m.status === 'active' ? <UserCheck size={11} /> : <UserX size={11} />}
                          {m.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      )}
                    </td>
                    {consentFormEnabled && (
                      <td className="px-4 py-3.5">
                        {isAdmin ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {m.consentStatus === 'accepted' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <ShieldCheck size={10} /> Consented
                              </span>
                            )}
                            {m.consentStatus === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <ShieldAlert size={10} /> Pending consent
                              </span>
                            )}
                            {m.consentStatus === 'declined' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                <ShieldX size={10} /> Declined
                              </span>
                            )}
                            {(m.consentStatus === null || m.consentStatus === undefined) && (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                            {m.consentStatus !== null && m.consentStatus !== undefined && (
                              <button
                                onClick={() => handleResetConsent(m.userEmail)}
                                disabled={isUpdating}
                                title="Reset consent"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-40"
                              >
                                <RotateCcw size={9} /> Reset
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {!isAdmin && (
                        <button
                          onClick={() => handleDeleteMember(m.userEmail)}
                          disabled={isUpdating}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                          title="Remove from org"
                        >
                          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
