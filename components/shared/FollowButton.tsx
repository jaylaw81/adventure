'use client'

import { useState } from 'react'
import { UserPlus, Clock, UserCheck } from 'lucide-react'

type FollowStatus = 'none' | 'pending' | 'accepted'

interface Props {
  username: string
  initialStatus: FollowStatus
}

export default function FollowButton({ username, initialStatus }: Props) {
  const [status, setStatus] = useState<FollowStatus>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)
  const [pulse, setPulse] = useState(false)

  const settle = (next: FollowStatus) => {
    setStatus(next)
    setPulse(true)
    setTimeout(() => setPulse(false), 260)
  }

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (status === 'none') {
        const res = await fetch(`/api/profile/follow/${username}`, { method: 'POST' })
        const data = await res.json()
        if (res.ok) settle(data.status)
      } else {
        const res = await fetch(`/api/profile/follow/${username}`, { method: 'DELETE' })
        if (res.ok) settle('none')
      }
    } finally {
      setLoading(false)
      setHover(false)
    }
  }

  const popStyle = pulse ? { animation: 'follow-pop 220ms cubic-bezier(0.16,1,0.3,1) both' } : undefined

  if (status === 'none') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
        data-follow-pop={pulse || undefined}
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', ...popStyle }}
      >
        <UserPlus size={12} />
        {loading ? 'Following…' : 'Follow'}
      </button>
    )
  }

  if (status === 'pending') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-colors disabled:opacity-50"
        data-follow-pop={pulse || undefined}
        style={popStyle}
      >
        <Clock size={12} />
        {loading ? 'Canceling…' : hover ? 'Cancel Request' : 'Requested'}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-colors disabled:opacity-50"
      data-follow-pop={pulse || undefined}
      style={popStyle}
    >
      <UserCheck size={12} />
      {loading ? 'Unfollowing…' : hover ? 'Unfollow' : 'Following'}
    </button>
  )
}
