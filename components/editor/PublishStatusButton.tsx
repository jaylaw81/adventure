'use client'

import { useState } from 'react'
import { Globe, Loader2, FileEdit } from 'lucide-react'

interface Props {
  adventureId: string
  initialStatus: string
  initialIsPublic: boolean
}

export default function PublishStatusButton({ adventureId, initialStatus, initialIsPublic }: Props) {
  const [status, setStatus]     = useState(initialStatus)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading]   = useState<'publish' | 'draft' | null>(null)
  const [error, setError]       = useState('')

  const isDraft = status === 'draft'

  async function handlePublish() {
    setLoading('publish')
    setError('')
    try {
      const res  = await fetch(`/api/adventures/${adventureId}/share`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not publish')
        return
      }
      setStatus('active')
      setIsPublic(true)
    } finally {
      setLoading(null)
    }
  }

  async function handleMoveToDraft() {
    setLoading('draft')
    setError('')
    try {
      const res  = await fetch(`/api/adventures/${adventureId}/share`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not move to draft')
        return
      }
      setStatus('draft')
      setIsPublic(false)
    } finally {
      setLoading(null)
    }
  }

  if (isDraft) {
    return (
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-xs text-red-500 max-w-[160px] truncate" title={error}>{error}</span>
        )}
        <button
          onClick={handlePublish}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loading === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
          {loading === 'publish' ? 'Publishing…' : 'Publish story'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <span className="text-xs text-red-500 max-w-[160px] truncate" title={error}>{error}</span>
      )}
      <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
        <Globe size={14} />
        Published
      </span>
      <button
        onClick={handleMoveToDraft}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-60"
        title="Remove from Explore and return to draft"
      >
        {loading === 'draft' ? <Loader2 size={12} className="animate-spin" /> : <FileEdit size={12} />}
        {loading === 'draft' ? 'Moving…' : 'Move to draft'}
      </button>
    </div>
  )
}
