'use client'

import { useState } from 'react'
import { Link2, Link2Off, Copy, Check } from 'lucide-react'

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
        const res = await fetch(`/api/adventures/${adventureId}/share`, { method: 'DELETE' })
        const data = await res.json()
        setIsPublic(false)
      } else {
        const res = await fetch(`/api/adventures/${adventureId}/share`, { method: 'POST' })
        const data = await res.json()
        setIsPublic(true)
        setShareToken(data.shareToken)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          isPublic
            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isPublic ? <Link2 size={14} /> : <Link2Off size={14} />}
        {loading ? '…' : isPublic ? 'Shared' : 'Share'}
      </button>

      {isPublic && shareUrl && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-xs text-gray-500 truncate flex-1 max-w-[140px]">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy link"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
        </div>
      )}
    </div>
  )
}
