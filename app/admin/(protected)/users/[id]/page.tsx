'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Play, ExternalLink, Globe, Lock, ShieldOff,
  Trash2, UserCheck, UserX, BookOpen, PauseCircle, CheckCircle2,
  Mail, X, Send, MessageSquare, ChevronDown, ChevronUp, Clock,
  Eye, EyeOff,
} from 'lucide-react'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults',
}

const AUDIENCE_COLOR: Record<string, string> = {
  all: 'bg-green-100 text-green-700',
  teens: 'bg-amber-100 text-amber-700',
  adults: 'bg-red-100 text-red-700',
}

interface AdminUser {
  id: string
  email: string
  displayName: string
  tier: string
  status: string
  createdAt: string
  storyCount: number
  profileVisible: boolean
  trialEndsAt: string | null
}

interface AdminStory {
  id: string
  title: string
  description: string
  audience: string
  isPublic: boolean
  status: string
  sceneCount: number
  createdAt: string
}

interface AdminMessage {
  id: string
  userId: string
  sentByEmail: string
  subject: string
  message: string
  sentAt: string
}

function ContactModal({
  user,
  onClose,
  onSent,
}: {
  user: AdminUser
  onClose: () => void
  onSent: (msg: AdminMessage) => void
}) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError('Both subject and message are required.')
      return
    }
    setSending(true)
    setError('')
    const res = await fetch(`/api/admin/users/${user.id}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    })
    if (res.ok) {
      const saved: AdminMessage = await res.json()
      onSent(saved)
      setSent(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to send message.')
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contact User</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <p className="font-semibold text-slate-900">Message sent!</p>
            <p className="text-sm text-slate-500 mt-1">Your message was delivered to {user.email}.</p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Important notice about your account"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message here…"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageRow({ msg }: { msg: AdminMessage }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Mail size={14} className="text-violet-500 shrink-0" />
          <span className="font-medium text-slate-900 text-sm truncate">{msg.subject}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-mono hidden sm:block">{msg.sentByEmail}</span>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {new Date(msg.sentAt).toLocaleString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2 font-mono">
            Sent by <span className="font-semibold text-slate-700">{msg.sentByEmail}</span> on{' '}
            {new Date(msg.sentAt).toLocaleString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
        </div>
      )}
    </div>
  )
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [user, setUser] = useState<AdminUser | null>(null)
  const [stories, setStories] = useState<AdminStory[]>([])
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [actingUser, setActingUser] = useState(false)
  const [actingStory, setActingStory] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch(`/api/admin/users/${id}/stories`).then(r => r.json()),
      fetch(`/api/admin/users/${id}/messages`).then(r => r.json()),
    ]).then(([allUsers, userStories, userMessages]) => {
      setUser((allUsers as AdminUser[]).find((u: AdminUser) => u.id === id) ?? null)
      setStories(userStories)
      setMessages(userMessages)
      setLoading(false)
    })
  }, [id])

  function handleMessageSent(msg: AdminMessage) {
    setMessages(prev => [msg, ...prev])
  }

  async function grantTrial() {
    if (!user) return
    if (!confirm(`Grant a fresh 7-day trial to ${user.email}?`)) return
    setActingUser(true)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'grant_trial' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUser(u => u ? { ...u, trialEndsAt: updated.trialEndsAt } : null)
    }
    setActingUser(false)
  }

  async function toggleSuspendUser() {
    if (!user) return
    setActingUser(true)
    const action = user.status === 'suspended' ? 'unsuspend' : 'suspend'
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUser(u => u ? { ...u, status: updated.status } : null)
    }
    setActingUser(false)
  }

  async function toggleProfileVisibility() {
    if (!user) return
    setActingUser(true)
    const action = user.profileVisible ? 'set_profile_private' : 'set_profile_public'
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUser(u => u ? { ...u, profileVisible: updated.profileVisible } : null)
    }
    setActingUser(false)
  }

  async function deleteUserAccount() {
    if (!confirm(`Permanently delete ${user?.email} and all their stories? This cannot be undone.`)) return
    setActingUser(true)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/users')
    setActingUser(false)
  }

  async function toggleSuspendStory(story: AdminStory) {
    setActingStory(story.id)
    const action = story.status === 'suspended' ? 'unsuspend' : 'suspend'
    const res = await fetch(`/api/admin/stories/${story.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, status: updated.status } : s))
    }
    setActingStory(null)
  }

  async function deleteStory(story: AdminStory) {
    if (!confirm(`Delete "${story.title}"? This cannot be undone.`)) return
    setActingStory(story.id)
    const res = await fetch(`/api/admin/stories/${story.id}`, { method: 'DELETE' })
    if (res.ok) setStories(prev => prev.filter(s => s.id !== story.id))
    setActingStory(null)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-slate-500">User not found.</p>
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline mt-2 inline-block">← Back to Users</Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {showContact && (
        <ContactModal
          user={user}
          onClose={() => setShowContact(false)}
          onSent={handleMessageSent}
        />
      )}

      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Users
      </Link>

      {/* User card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.displayName || '(no name)'}</h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.tier === 'organization' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {user.tier}
              </span>
              {user.status === 'suspended' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <UserX size={11} /> Suspended
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <UserCheck size={11} /> Active
                </span>
              )}
              {(() => {
                if (!user.trialEndsAt) return (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                    <Clock size={11} /> No trial
                  </span>
                )
                const trialEnd = new Date(user.trialEndsAt)
                const active = trialEnd > new Date()
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Clock size={11} />
                    {active ? `Trial ends ${trialEnd.toLocaleDateString()}` : `Trial expired ${trialEnd.toLocaleDateString()}`}
                  </span>
                )
              })()}
              <span className="text-xs text-slate-400">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Mail size={14} /> Contact User
            </button>
            <button
              onClick={grantTrial}
              disabled={actingUser}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            >
              <Clock size={14} /> Grant 7-day Trial
            </button>
            <button
              onClick={toggleProfileVisibility}
              disabled={actingUser}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            >
              {user.profileVisible
                ? <><EyeOff size={14} /> Make Profile Private</>
                : <><Eye size={14} /> Make Profile Public</>}
            </button>
            <button
              onClick={toggleSuspendUser}
              disabled={actingUser}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                user.status === 'suspended'
                  ? 'bg-green-100 hover:bg-green-200 text-green-700'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
              }`}
            >
              {user.status === 'suspended'
                ? <><UserCheck size={14} /> Unsuspend Account</>
                : <><ShieldOff size={14} /> Suspend Account</>}
            </button>
            <button
              onClick={deleteUserAccount}
              disabled={actingUser}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="mb-4 flex items-center gap-3">
        <BookOpen size={16} className="text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-900">Stories ({stories.length})</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-10">
        {stories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No stories.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Story</th>
                <th className="text-left px-4 py-3 font-semibold">Audience</th>
                <th className="text-left px-4 py-3 font-semibold">Scenes</th>
                <th className="text-left px-4 py-3 font-semibold">Visibility</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stories.map(story => (
                <tr key={story.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="font-medium text-slate-900 truncate">{story.title}</p>
                    {story.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{story.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AUDIENCE_COLOR[story.audience] ?? 'bg-slate-100 text-slate-600'}`}>
                      {AUDIENCE_LABEL[story.audience] ?? story.audience}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{story.sceneCount}</td>
                  <td className="px-4 py-4">
                    {story.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <Globe size={12} /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Lock size={12} /> Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {story.status === 'suspended' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <PauseCircle size={11} /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 size={11} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/play/${story.id}`}
                        target="_blank"
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                        title="Play story"
                      >
                        <Play size={13} />
                      </Link>
                      <Link
                        href={`/edit/${story.id}`}
                        target="_blank"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Edit story"
                      >
                        <ExternalLink size={13} />
                      </Link>
                      <button
                        onClick={() => toggleSuspendStory(story)}
                        disabled={actingStory === story.id}
                        title={story.status === 'suspended' ? 'Unsuspend story' : 'Suspend story'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                          story.status === 'suspended'
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                        }`}
                      >
                        {story.status === 'suspended' ? <CheckCircle2 size={13} /> : <PauseCircle size={13} />}
                      </button>
                      <button
                        onClick={() => deleteStory(story)}
                        disabled={actingStory === story.id}
                        title="Delete story"
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message history */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Message History ({messages.length})</h2>
        </div>
        <button
          onClick={() => setShowContact(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Send size={12} /> New Message
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={18} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">No messages sent to this user yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map(msg => (
            <MessageRow key={msg.id} msg={msg} />
          ))}
        </div>
      )}
    </div>
  )
}
