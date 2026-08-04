'use client'

import { useEffect, useState } from 'react'
import { UserX, Ban } from 'lucide-react'

interface BlockedUser {
  username: string
  displayName: string
  blockedAt: string
}

export default function BlockedUsersSection() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/profile/blocks')
      .then(r => r.json())
      .then((data: BlockedUser[]) => { if (Array.isArray(data)) setBlocked(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleBlock = async () => {
    const candidate = username.trim().toLowerCase()
    if (!candidate) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/profile/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: candidate }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to block user')
      } else {
        setUsername('')
        fetch('/api/profile/blocks')
          .then(r => r.json())
          .then((d: BlockedUser[]) => { if (Array.isArray(d)) setBlocked(d) })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnblock = async (targetUsername: string) => {
    setBlocked(prev => prev.filter(b => b.username !== targetUsername))
    await fetch(`/api/profile/blocks/${targetUsername}`, { method: 'DELETE' })
  }

  return (
    <div className="border-t border-violet-100 pt-6 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <Ban size={16} className="text-gray-500" />
        <h3 className="text-base font-bold text-gray-900">Blocked Users</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Blocked users can no longer view your profile page.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={username}
          onChange={e => { setUsername(e.target.value); setError('') }}
          placeholder="username"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          onKeyDown={e => e.key === 'Enter' && handleBlock()}
        />
        <button
          onClick={handleBlock}
          disabled={submitting || !username.trim()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          {submitting ? 'Blocking…' : 'Block'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {!loading && blocked.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
          {blocked.map(b => (
            <div key={b.username} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-gray-700 truncate">@{b.username}</span>
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
  )
}
