'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2 } from 'lucide-react'
import { analytics } from '@/lib/analytics'

const CHOICE_EMOJIS = ['❤️', '👍', '🔥']

interface Props {
  href: string
  label: string
  index: number
  adventureId: string
}

export default function ChoiceButton({ href, label, index, adventureId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const emoji = CHOICE_EMOJIS[index]

  const handleClick = () => {
    if (loading) return
    analytics.choiceSelected(adventureId, label, index)
    setLoading(true)
    router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-between w-full px-5 py-4 bg-white border-2 border-amber-200 rounded-xl text-gray-800 font-medium hover:bg-amber-50 hover:border-amber-400 transition-all group shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span className="flex items-center gap-3">
        {emoji && <span className="text-xl">{emoji}</span>}
        {label}
      </span>
      {loading ? (
        <Loader2 size={18} className="text-amber-400 animate-spin shrink-0" />
      ) : (
        <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
      )}
    </button>
  )
}
