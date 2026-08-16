'use client'

import { useEffect, useState } from 'react'
import { Check, X, Ban, UserX, UserPlus } from 'lucide-react'

interface FollowRequest {
  username: string
  displayName: string
  requestedAt: string
}

interface DeniedRequest {
  username: string
  displayName: string
  deniedAt: string
}

interface BlockedUser {
  username: string
  displayName: string
  blockedAt: string
}

type InnerTab = 'requests' | 'denied' | 'blocked'

const INNER_TABS: { id: InnerTab; label: string }[] = [
  { id: 'requests', label: 'Follow Requests' },
  { id: 'denied', label: 'Denied' },
  { id: 'blocked', label: 'Blocked' },
]

export default function FollowManagementSection() {
  const [tab, setTab] = useState<InnerTab>('requests')
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [denied, setDenied] = useState<DeniedRequest[]>([])
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [blockInput, setBlockInput] = useState('')
  const [blockSubmitting, setBlockSubmitting] = useState(false)
  const [blockError, setBlockError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/profile/follow/requests').then(r => r.json()),
      fetch('/api/profile/follow/requests?status=denied').then(r => r.json()),
      fetch('/api/profile/blocks').then(r => r.json()),
    ]).then(([reqData, deniedData, blockedData]) => {
      if (Array.isArray(reqData)) setRequests(reqData)
      if (Array.isArray(deniedData)) setDenied(deniedData)
      if (Array.isArray(blockedData)) setBlocked(blockedData)
    }).finally(() => setLoading(false))
  }, [])

  const handleAllow = async (username: string) => {
    setBusy(username)
    try {
      const res = await fetch(`/api/profile/follow/requests/${username}/accept`, { method: 'POST' })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.username !== username))
        setDenied(prev => prev.filter(r => r.username !== username))
      }
    } finally {
      setBusy(null)
    }
  }

  const handleDeny = async (username: string) => {
    setBusy(username)
    try {
      const res = await fetch(`/api/profile/follow/requests/${username}/deny`, { method: 'POST' })
      if (res.ok) {
        const req = requests.find(r => r.username === username)
        setRequests(prev => prev.filter(r => r.username !== username))
        if (req) setDenied(prev => [{ username: req.username, displayName: req.displayName, deniedAt: new Date().toISOString() }, ...prev])
      }
    } finally {
      setBusy(null)
    }
  }

  const handleRemoveDenied = async (username: string) => {
    setBusy(username)
    try {
      const res = await fetch(`/api/profile/follow/requests/${username}`, { method: 'DELETE' })
      if (res.ok) setDenied(prev => prev.filter(r => r.username !== username))
    } finally {
      setBusy(null)
    }
  }

  const handleBlockFromList = async (username: string) => {
    setBusy(username)
    try {
      const res = await fetch('/api/profile/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (res.ok) {
        const displayName = requests.find(r => r.username === username)?.displayName
          ?? denied.find(r => r.username === username)?.displayName ?? ''
        setRequests(prev => prev.filter(r => r.username !== username))
        setDenied(prev => prev.filter(r => r.username !== username))
        setBlocked(prev => [{ username, displayName, blockedAt: new Date().toISOString() }, ...prev])
      }
    } finally {
      setBusy(null)
    }
  }

  const handleBlockByUsername = async () => {
    const candidate = blockInput.trim().toLowerCase()
    if (!candidate) return
    setBlockSubmitting(true)
    setBlockError('')
    try {
      const res = await fetch('/api/profile/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: candidate }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBlockError(data.error ?? 'Failed to block user')
      } else {
        setBlockInput('')
        setRequests(prev => prev.filter(r => r.username !== candidate))
        setDenied(prev => prev.filter(r => r.username !== candidate))
        fetch('/api/profile/blocks')
          .then(r => r.json())
          .then((d: BlockedUser[]) => { if (Array.isArray(d)) setBlocked(d) })
      }
    } finally {
      setBlockSubmitting(false)
    }
  }

  const handleUnblock = async (username: string) => {
    setBlocked(prev => prev.filter(b => b.username !== username))
    await fetch(`/api/profile/blocks/${username}`, { method: 'DELETE' })
  }

  const counts: Record<InnerTab, number> = {
    requests: requests.length,
    denied: denied.length,
    blocked: blocked.length,
  }

  return (
    <div className="border-t border-violet-100 pt-6 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus size={16} className="text-violet-500" />
        <h3 className="text-base font-bold text-gray-900">Manage Followers</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Review who wants to follow your private profile, and manage anyone you&apos;ve denied or blocked.
      </p>

      <div className="flex gap-1.5 mb-4 border-b border-gray-100">
        {INNER_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-violet-500 text-violet-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                tab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-4">Loading…</p>
      ) : tab === 'requests' ? (
        requests.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No pending follow requests.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {requests.map(r => (
              <div key={r.username} className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3.5 py-2.5">
                <span className="text-gray-700 truncate font-medium">{r.displayName || `@${r.username}`}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAllow(r.username)}
                    disabled={busy === r.username}
                    className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Check size={12} />
                    Allow
                  </button>
                  <button
                    onClick={() => handleDeny(r.username)}
                    disabled={busy === r.username}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <X size={12} />
                    Deny
                  </button>
                  <button
                    onClick={() => handleBlockFromList(r.username)}
                    disabled={busy === r.username}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-500 border border-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Ban size={12} />
                    Block
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'denied' ? (
        denied.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No denied follow requests.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {denied.map(r => (
              <div key={r.username} className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3.5 py-2.5">
                <span className="text-gray-700 truncate font-medium">{r.displayName || `@${r.username}`}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAllow(r.username)}
                    disabled={busy === r.username}
                    className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Check size={12} />
                    Allow
                  </button>
                  <button
                    onClick={() => handleBlockFromList(r.username)}
                    disabled={busy === r.username}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-500 border border-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Ban size={12} />
                    Block
                  </button>
                  <button
                    onClick={() => handleRemoveDenied(r.username)}
                    disabled={busy === r.username}
                    title="Remove from this list"
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-400 border border-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <X size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={blockInput}
              onChange={e => { setBlockInput(e.target.value); setBlockError('') }}
              placeholder="username"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              onKeyDown={e => e.key === 'Enter' && handleBlockByUsername()}
            />
            <button
              onClick={handleBlockByUsername}
              disabled={blockSubmitting || !blockInput.trim()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
            >
              {blockSubmitting ? 'Blocking…' : 'Block'}
            </button>
          </div>
          {blockError && <p className="text-xs text-red-500 mb-3">{blockError}</p>}

          {blocked.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No blocked users.</p>
          ) : (
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
              {blocked.map(b => (
                <div key={b.username} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-700 truncate">{b.displayName || `@${b.username}`}</span>
                  <button
                    onClick={() => handleUnblock(b.username)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    <UserX size={12} />
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
