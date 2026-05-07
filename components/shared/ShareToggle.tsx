'use client'

import { useState } from 'react'
import { Copy, Check, Lock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { analytics } from '@/lib/analytics'
import type { ValidationIssue } from '@/app/api/adventures/[id]/validate/route'

interface Props {
  adventureId: string
  initialIsPublic: boolean
  initialShareToken: string | null
  canMakePublic?: boolean
}

export default function ShareToggle({ adventureId, initialIsPublic, initialShareToken, canMakePublic = true }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareToken, setShareToken] = useState(initialShareToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [canPublishAnyway, setCanPublishAnyway] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const shareUrl = shareToken
    ? `${window.location.origin}/s/${shareToken}`
    : null

  const doPublish = async () => {
    const res = await fetch(`/api/adventures/${adventureId}/share`, { method: 'POST' })
    const data = await res.json()
    setIsPublic(true)
    setShareToken(data.shareToken)
    setShowPanel(false)
    setValidationIssues([])
    analytics.shareEnabled(adventureId)
  }

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isPublic) {
        await fetch(`/api/adventures/${adventureId}/share`, { method: 'DELETE' })
        setIsPublic(false)
        setShowPanel(false)
        setValidationIssues([])
        analytics.shareDisabled(adventureId)
        return
      }

      // Pre-publish validation
      const res = await fetch(`/api/adventures/${adventureId}/validate`)
      const { issues, canPublish } = await res.json()

      if (issues.length === 0) {
        // Clean — publish immediately with no friction
        await doPublish()
        return
      }

      // Show the issues panel; let the user decide
      setValidationIssues(issues)
      setCanPublishAnyway(canPublish)
      setShowPanel(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishAnyway = async () => {
    setLoading(true)
    try {
      await doPublish()
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

  if (!canMakePublic) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Lock size={11} className="shrink-0" />
        <span>Publishing restricted by your organization</span>
      </div>
    )
  }

  const hasErrors = validationIssues.some(i => i.severity === 'error')

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

      {/* Pre-publish validation panel */}
      {showPanel && validationIssues.length > 0 && (
        <div className={`rounded-xl border p-3 flex flex-col gap-2.5 ${
          hasErrors
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-xs font-semibold ${hasErrors ? 'text-red-700' : 'text-amber-800'}`}>
            {hasErrors ? 'Fix these issues before publishing:' : 'Your story has some issues:'}
          </p>

          <ul className="flex flex-col gap-1.5">
            {validationIssues.map(issue => (
              <li key={issue.code} className="flex items-start gap-2">
                {issue.severity === 'error'
                  ? <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                  : <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                }
                <span className={`text-xs leading-snug ${issue.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                  {issue.message}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 pt-0.5">
            <Link
              href={`/edit/${adventureId}`}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                hasErrors
                  ? 'text-red-600 hover:text-red-800'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Edit story
              <ArrowRight size={11} />
            </Link>
            {canPublishAnyway && (
              <>
                <span className="text-amber-300 text-xs">·</span>
                <button
                  onClick={handlePublishAnyway}
                  disabled={loading}
                  className="text-xs text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Publishing…' : 'Publish anyway'}
                </button>
              </>
            )}
            <button
              onClick={() => { setShowPanel(false); setValidationIssues([]) }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
