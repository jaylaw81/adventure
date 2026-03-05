'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface Props {
  adventureId: string
  initialIsPublic: boolean
  initialShareToken: string | null
}

export default function ShareToggle({ adventureId, initialIsPublic, initialShareToken }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareToken, setShareToken] = useState(initialShareToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken
    ? `${window.location.origin}/s/${shareToken}`
    : null

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isPublic) {
        await fetch(`/api/adventures/${adventureId}/share`, { method: 'DELETE' })
        setIsPublic(false)
        analytics.shareDisabled(adventureId)
      } else {
        const res = await fetch(`/api/adventures/${adventureId}/share`, { method: 'POST' })
        const data = await res.json()
        setIsPublic(true)
        setShareToken(data.shareToken)
        analytics.shareEnabled(adventureId)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    analytics.shareLinkCopied(adventureId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Make public</span>
        <button
          role="switch"
          aria-checked={isPublic}
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            isPublic ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
              isPublic ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Share URL */}
      {isPublic && shareUrl && (
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2">
          <span className="flex-1 truncate text-xs text-gray-500 font-mono">{shareUrl}</span>
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy link'}
            className="shrink-0 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-amber-600 transition-colors"
          >
            {copied
              ? <><Check size={12} className="text-green-500" /><span className="text-green-500">Copied</span></>
              : <><Copy size={12} /><span>Copy</span></>
            }
          </button>
        </div>
      )}
    </div>
  )
}
