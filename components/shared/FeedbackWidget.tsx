'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X, Send, CheckCircle, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { SHOW_FEEDBACK_WIDGET_EVENT, FEEDBACK_WIDGET_HIDDEN_KEY } from '@/lib/feedbackWidgetEvent'

type FeedbackType = 'question' | 'concern' | 'other'

const TYPE_LABELS: Record<FeedbackType, string> = {
  question: 'Question',
  concern:  'Concern',
  other:    'Other',
}

const PLACEHOLDERS: Record<FeedbackType, string> = {
  question: "What's your question?",
  concern:  "What are you concerned about?",
  other:    "What's on your mind?",
}

const MAX = 2000

export default function FeedbackWidget() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const [open, setOpen]       = useState(false)
  const [type, setType]       = useState<FeedbackType>('question')
  const [message, setMessage] = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [hidden, setHidden]   = useState(false)

  useEffect(() => {
    if (localStorage.getItem(FEEDBACK_WIDGET_HIDDEN_KEY) === '1') {
      setHidden(true)
    }
  }, [])

  useEffect(() => {
    function handleShowEvent() {
      localStorage.removeItem(FEEDBACK_WIDGET_HIDDEN_KEY)
      setHidden(false)
      setOpen(true)
    }
    window.addEventListener(SHOW_FEEDBACK_WIDGET_EVENT, handleShowEvent)
    return () => window.removeEventListener(SHOW_FEEDBACK_WIDGET_EVENT, handleShowEvent)
  }, [])

  // Don't show in the admin panel
  if (pathname?.startsWith('/admin')) return null
  if (hidden) return null

  const userEmail = session?.user?.email ?? ''

  function reset() {
    setSuccess(false)
    setMessage('')
    setEmail('')
    setError('')
    setType('question')
  }

  function handleClose() {
    setOpen(false)
    setTimeout(reset, 250)
  }

  function handleHide(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.setItem(FEEDBACK_WIDGET_HIDDEN_KEY, '1')
    setHidden(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed.length < 10) {
      setError('Please enter at least 10 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: trimmed,
          email: userEmail || email.trim(),
          pageUrl: window.location.pathname,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit. Please try again.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen(true)}
          aria-label="Share feedback"
          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: '#7c3aed',
            boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
          }}
        >
          <MessageCircle size={20} className="text-white" />
        </button>
        <button
          onClick={handleHide}
          aria-label="Hide feedback button"
          title="Hide feedback button"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-white text-gray-400 border border-gray-200 shadow-sm transition-colors hover:text-gray-600 hover:border-gray-300"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          {/* Panel */}
          <div
            className="w-full sm:w-96 rounded-t-2xl sm:rounded-xl overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Share feedback</h2>
              <button
                onClick={handleClose}
                aria-label="Close feedback"
                className="text-gray-400 hover:text-gray-600 transition-colors rounded p-0.5"
              >
                <X size={18} />
              </button>
            </div>

            {success ? (
              /* Success state */
              <div className="flex flex-col items-center text-center py-12 px-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: '#f5f3ff' }}>
                  <CheckCircle size={24} className="text-violet-500" />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">Thanks for the feedback!</p>
                <p className="text-sm text-gray-500 max-w-xs">
                  We read every message and use it to make StoryQuestor better.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-5 py-2 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">

                {/* Type selector */}
                <div className="flex gap-2">
                  {(Object.keys(TYPE_LABELS) as FeedbackType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={type === t
                        ? { background: '#7c3aed', color: '#fff' }
                        : { background: '#f5f3ff', color: '#5b21b6' }
                      }
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <div>
                  <textarea
                    value={message}
                    onChange={e => { setMessage(e.target.value.slice(0, MAX)); setError('') }}
                    placeholder={PLACEHOLDERS[type]}
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none resize-none px-3 py-2.5 text-sm text-gray-800 transition-colors placeholder:text-gray-400"
                  />
                  <div className="flex justify-between items-center mt-1 min-h-[1.25rem]">
                    {error
                      ? <p className="text-xs text-red-500">{error}</p>
                      : <span />
                    }
                    <p className="text-xs text-gray-400 ml-auto tabular-nums">{message.length}/{MAX}</p>
                  </div>
                </div>

                {/* Email — only shown to guests */}
                {!userEmail && (
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email (optional, for follow-up)"
                    className="w-full rounded-lg border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-3 py-2.5 text-sm text-gray-800 transition-colors placeholder:text-gray-400"
                  />
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || message.trim().length < 10}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#7c3aed' }}
                >
                  {loading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Send size={15} />
                  }
                  {loading ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
