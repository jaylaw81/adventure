'use client'

import { useEffect, useState } from 'react'
import { Check, X, UserPlus } from 'lucide-react'

interface FollowRequest {
  username: string
  displayName: string
  requestedAt: string
}

export default function FollowRequestsSection() {
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile/follow/requests')
      .then(r => r.json())
      .then((data: FollowRequest[]) => { if (Array.isArray(data)) setRequests(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleAccept = async (username: string) => {
    setBusy(username)
    try {
      const res = await fetch(`/api/profile/follow/requests/${username}/accept`, { method: 'POST' })
      if (res.ok) setRequests(prev => prev.filter(r => r.username !== username))
    } finally {
      setBusy(null)
    }
  }

  const handleDecline = async (username: string) => {
    setBusy(username)
    try {
      const res = await fetch(`/api/profile/follow/requests/${username}`, { method: 'DELETE' })
      if (res.ok) setRequests(prev => prev.filter(r => r.username !== username))
    } finally {
      setBusy(null)
    }
  }

  if (!loading && requests.length === 0) return null

  return (
    <div className="border-t border-violet-100 pt-6 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus size={16} className="text-violet-500" />
        <h3 className="text-base font-bold text-gray-900">Follow Requests</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        People who want to follow your private profile.
      </p>

      {!loading && (
        <div className="flex flex-col gap-2">
          {requests.map(r => (
            <div key={r.username} className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3.5 py-2.5">
              <span className="text-gray-700 truncate font-medium">{r.displayName || `@${r.username}`}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleAccept(r.username)}
                  disabled={busy === r.username}
                  className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Check size={12} />
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(r.username)}
                  disabled={busy === r.username}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <X size={12} />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
