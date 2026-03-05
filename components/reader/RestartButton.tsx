'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface Props {
  href: string
  adventureId: string
}

export default function RestartButton({ href, adventureId }: Props) {
  return (
    <Link
      href={href}
      onClick={() => analytics.storyRestart(adventureId)}
      className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
    >
      <RotateCcw size={16} />
      Play Again
    </Link>
  )
}
