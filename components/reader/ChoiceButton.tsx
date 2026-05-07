'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import { startSceneTransition } from '@/lib/scene-transition'

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const BADGE_COLORS = [
  { bg: 'from-amber-400 to-orange-500', ring: 'ring-amber-300' },
  { bg: 'from-violet-500 to-purple-600', ring: 'ring-violet-300' },
  { bg: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-300' },
  { bg: 'from-sky-400 to-blue-500', ring: 'ring-sky-300' },
  { bg: 'from-rose-400 to-pink-500', ring: 'ring-rose-300' },
  { bg: 'from-fuchsia-400 to-indigo-500', ring: 'ring-fuchsia-300' },
]

interface Props {
  href: string
  label: string
  index: number
  adventureId: string
}

export default function ChoiceButton({ href, label, index, adventureId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const letter = LABELS[index % LABELS.length] ?? 'A'
  const color = BADGE_COLORS[index % BADGE_COLORS.length]

  const handleClick = () => {
    if (loading) return
    analytics.choiceSelected(adventureId, label, index)
    try {
      const key = `sq_history_${adventureId}`
      const prev: string[] = JSON.parse(sessionStorage.getItem(key) ?? '[]')
      prev.push(label)
      sessionStorage.setItem(key, JSON.stringify(prev))
    } catch { /* ignore */ }
    setLoading(true)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      router.push(href)
    } else {
      startSceneTransition(() => router.push(href))
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="group flex items-center gap-4 w-full px-5 py-4 bg-white border-2 border-violet-100 rounded-xl font-medium cursor-pointer hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      style={{ color: '#1e0a3c' }}
    >
      {/* Alpha badge */}
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${color.bg} text-white text-sm font-bold shrink-0 shadow-sm ring-2 ring-white group-hover:scale-110 transition-transform duration-150`}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : letter}
      </span>

      {/* Label */}
      <span className="flex-1 text-left">{label}</span>

      {/* Arrow */}
      {!loading && (
        <svg
          className="w-4 h-4 text-violet-200 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-150 shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}
