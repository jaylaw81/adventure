'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users, Check, X, Loader2, Globe, Lock, EyeOff, Layers, ChevronDown, ChevronRight, UserCheck, UserX } from 'lucide-react'

type PrivacyLevel = 'inherit' | 'public' | 'org-only' | 'private'

interface Group {
  id: string
  name: string
  description: string | null
  privacyLevel: PrivacyLevel
  createdAt: string
}

interface Member {
  id: string
  userEmail: string
  displayName: string | null
  role: string
  status: string
  groups: { id: string; name: string }[]
}

const PRIVACY_OPTIONS: { value: PrivacyLevel; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'inherit', label: 'Inherit from org', icon: <Layers size={12} />, color: 'text-slate-400' },
  { value: 'public', label: 'Public', icon: <Globe size={12} />, color: 'text-green-600' },
  { value: 'org-only', label: 'Org only', icon: <Lock size={12} />, color: 'text-amber-600' },
  { value: 'private', label: 'Private', icon: <EyeOff size={12} />, color: 'text-slate-500' },
]

const ROLE_STYLES: Record<string, string> = {
  teacher: 'bg-blue-50 text-blue-700',
  reviewer: 'bg-purple-50 text-purple-700',
  member: 'bg-slate-100 text-slate-500',
}

function PrivacySelect({ value, onChange }: { value: PrivacyLevel; onChange: (v: PrivacyLevel) => void }) {
  const current = PRIVACY_OPTIONS.find(o => o.value === value) ?? PRIVACY_OPTIONS[0]
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value as PrivacyLevel)}
        className="appearance-none pl-6 pr-7 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer text-slate-700"
      >
        {PRIVACY_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${current.color}`}>
        {current.icon}
      </span>
    </div>
  )
}

function MemberList({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic py-2">No members in this group yet.</p>
    )
  }
  return (
    <div className="divide-y divide-slate-100">
      {members.map(m => (
        <div key={m.id} className="flex items-center gap-3 py-2 px-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            {(m.displayName || m.userEmail)[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{m.displayName || m.userEmail}</p>
            <p className="text-xs text-slate-400 font-mono truncate">{m.userEmail}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {m.role !== 'member' && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${ROLE_STYLES[m.role] ?? 'bg-slate-100 text-slate-500'}`}>
                {m.role}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
            }`}>
              {m.status === 'active' ? <UserCheck size={10} /> : <UserX size={10} />}
              {m.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function GroupRow({
  group,
  members,
  onSave,
  onDelete,
}: {
  group: Group
  members: Member[]
  onSave: (id: string, updates: Partial<Group>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(group.name)
  const [desc, setDesc] = useState(group.description ?? '')
  const [privacy, setPrivacy] = useState<PrivacyLevel>(group.privacyLevel)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave(group.id, { name, description: desc || null, privacyLevel: privacy })
    setSaving(false)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${group.name}"? Members will become ungrouped.`)) return
    setDeleting(true)
    await onDelete(group.id)
  }

  async function handlePrivacyChange(v: PrivacyLevel) {
    setPrivacy(v)
    await onSave(group.id, { privacyLevel: v })
  }

  return (
    <>
      <tr className={`transition-colors align-top ${expanded ? 'bg-amber-50/40' : 'hover:bg-slate-50'}`}>
        {/* Expand toggle */}
        <td className="pl-3 pr-0 py-4 w-8">
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1 rounded text-slate-400 hover:text-amber-600 transition-colors"
            title={expanded ? 'Collapse' : 'Expand members'}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </td>

        {/* Name / description */}
        <td className="px-3 py-4">
          {editing ? (
            <div className="flex flex-col gap-1.5">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={200}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={500}
                placeholder="Description (optional)"
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          ) : (
            <>
              <p className="font-medium text-slate-900">{group.name}</p>
              {group.description && <p className="text-xs text-slate-400 mt-0.5">{group.description}</p>}
            </>
          )}
        </td>

        {/* Member count */}
        <td className="px-4 py-4">
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-amber-600 transition-colors"
          >
            <Users size={13} className="text-slate-400" />
            {members.length}
          </button>
        </td>

        {/* Privacy */}
        <td className="px-4 py-4">
          {editing ? (
            <PrivacySelect value={privacy} onChange={setPrivacy} />
          ) : (
            <PrivacySelect value={group.privacyLevel} onChange={handlePrivacyChange} />
          )}
        </td>

        {/* Created */}
        <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
          {new Date(group.createdAt).toLocaleDateString()}
        </td>

        {/* Actions */}
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(group.name); setDesc(group.description ?? '') }}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Rename"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  title="Delete group"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded member list */}
      {expanded && (
        <tr>
          <td colSpan={6} className="px-0 pb-3 pt-0">
            <div className="mx-4 rounded-xl border border-amber-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Members in {group.name}
              </p>
              <MemberList members={members} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrivacy, setNewPrivacy] = useState<PrivacyLevel>('inherit')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showUngrouped, setShowUngrouped] = useState(false)

  const load = useCallback(async () => {
    const [g, m] = await Promise.all([
      fetch('/api/org/groups').then(r => r.json()),
      fetch('/api/org/members').then(r => r.json()),
    ])
    setGroups(Array.isArray(g) ? g : [])
    setMembers(Array.isArray(m) ? m : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const ungroupedMembers = members.filter(m => m.groups.length === 0 && m.role !== 'admin')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    await fetch('/api/org/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc, privacyLevel: newPrivacy }),
    })
    setNewName('')
    setNewDesc('')
    setNewPrivacy('inherit')
    setShowForm(false)
    setCreating(false)
    await load()
  }

  async function handleSave(id: string, updates: Partial<Group>) {
    await fetch(`/api/org/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    await load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/org/groups/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Groups</h1>
          <p className="text-slate-500 text-sm mt-1">Organize members into classes or sub-groups, each with its own privacy setting</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <Plus size={15} /> New group
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-amber-200 p-5 mb-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-700">Create a new group</h2>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Group name (e.g. Period 1, Class A)"
            maxLength={200}
            required
            autoFocus
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="text"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600">Privacy:</label>
            <PrivacySelect value={newPrivacy} onChange={setNewPrivacy} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : null}
              Create group
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No groups yet. Create one to organize your members into classes.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-3 py-3 w-8" />
                <th className="text-left px-3 py-3 font-semibold">Group name</th>
                <th className="text-left px-4 py-3 font-semibold">Members</th>
                <th className="text-left px-4 py-3 font-semibold">Privacy</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map(group => (
                <GroupRow
                  key={group.id}
                  group={group}
                  members={members.filter(m => m.groups.some(g => g.id === group.id))}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && groups.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 text-right">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
      )}

      {/* Ungrouped members */}
      {!loading && ungroupedMembers.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowUngrouped(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showUngrouped ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              <span className="text-sm font-semibold text-slate-700">Ungrouped members</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">{ungroupedMembers.length}</span>
            </div>
            <span className="text-xs text-slate-400">Members not assigned to any group</span>
          </button>
          {showUngrouped && (
            <div className="border-t border-slate-100 px-5 py-3">
              <MemberList members={ungroupedMembers} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
