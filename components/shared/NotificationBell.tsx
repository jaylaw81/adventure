'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, UserPlus, UserCheck } from 'lucide-react'

interface NotificationItem {
  id: string
  type: string
  actorUsername: string | null
  actorDisplayName: string
  createdAt: string
}

const POLL_MS = 120_000

function formatRelative(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.notifications)) setNotifications(data.notifications)
        if (typeof data?.unreadCount === 'number') setUnreadCount(data.unreadCount)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }

  useEffect(() => {
    fetchNotifications()

    // Only poll while the tab is actually visible — a backgrounded tab left open
    // otherwise keeps the DB compute from ever suspending.
    const interval = setInterval(() => {
      if (!document.hidden) fetchNotifications()
    }, POLL_MS)

    const onVisibility = () => {
      if (!document.hidden) fetchNotifications()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) {
      setUnreadCount(0)
      fetch('/api/notifications/read', { method: 'POST' }).catch(() => {})
    }
  }

  return (
    <div ref={ref} className="relative ml-auto">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-amber-500 text-white text-[10px] font-bold leading-[15px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #2d0b69, #1a1040)' }}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white">Notifications</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!loaded ? (
              <p className="px-4 py-6 text-center text-sm text-white/40">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-white/40">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  href={n.type === 'follow_request' ? '/profile?tab=privacy' : `/u/${n.actorUsername}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-white/80"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    {n.type === 'follow_request' ? <UserPlus size={13} /> : <UserCheck size={13} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white/85 leading-snug">
                      <span className="font-semibold text-white">{n.actorDisplayName || `@${n.actorUsername}`}</span>
                      {' '}
                      {n.type === 'follow_request' ? 'requested to follow you' : 'started following you'}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{formatRelative(n.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
