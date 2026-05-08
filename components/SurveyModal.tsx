'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { X, MessageSquareHeart, CheckCircle2 } from 'lucide-react'

const MIN_USAGE_MS = 10 * 60 * 1000  // 10 minutes from first ever visit
const SHOW_DELAY_MS = 30_000          // additional buffer after the gate passes

type SurveyType = 'initial' | 'followup'

export default function SurveyModal() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [surveyType, setSurveyType] = useState<SurveyType>('initial')
  const [likes, setLikes] = useState('')
  const [dislikes, setDislikes] = useState('')
  const [featureRequests, setFeatureRequests] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (pathname.startsWith('/admin')) return
    if (!session?.user?.email) return

    // Record the first time this user ever lands on the site
    const FIRST_VISIT_KEY = 'sq_first_visit'
    const stored = localStorage.getItem(FIRST_VISIT_KEY)
    const firstVisit = stored ? parseInt(stored, 10) : Date.now()
    if (!stored) localStorage.setItem(FIRST_VISIT_KEY, String(firstVisit))

    const timeUntilGate = Math.max(0, firstVisit + MIN_USAGE_MS - Date.now())

    let gateTimer: ReturnType<typeof setTimeout>
    let showTimer: ReturnType<typeof setTimeout>

    async function checkAndSchedule() {
      try {
        const res = await fetch('/api/survey')
        if (!res.ok) return
        const data = await res.json()
        if (data.shouldShow) {
          setSurveyType(data.surveyType ?? 'initial')
          showTimer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS)
        }
      } catch {
        // silently skip if check fails
      }
    }

    gateTimer = setTimeout(checkAndSchedule, timeUntilGate)
    return () => {
      clearTimeout(gateTimer)
      clearTimeout(showTimer)
    }
  }, [status, session])

  const handleClose = useCallback(async () => {
    setIsVisible(false)
    try {
      await fetch('/api/survey/dismiss', { method: 'POST' })
    } catch {
      // best-effort
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!likes.trim() && !dislikes.trim() && !featureRequests.trim()) return

    setIsSubmitting(true)
    try {
      await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likes, dislikes, featureRequests, surveyType }),
      })
      setSubmitted(true)
      setTimeout(() => setIsVisible(false), 2500)
    } catch {
      // best-effort; still mark submitted to avoid repeat
      setSubmitted(true)
      setTimeout(() => setIsVisible(false), 2500)
    } finally {
      setIsSubmitting(false)
    }
  }, [likes, dislikes, featureRequests, surveyType])

  if (!isVisible) return null

  const hasInput = likes.trim() || dislikes.trim() || featureRequests.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(13,12,26,0.75)' }}
        onClick={submitted ? undefined : handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <MessageSquareHeart size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {surveyType === 'followup' ? 'Check-in Feedback' : 'Share Your Feedback'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {surveyType === 'followup'
                  ? "It's been a while — what's changed for you?"
                  : 'Help us make StoryQuestor better for you'}
              </p>
            </div>
          </div>
          {!submitted && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close survey"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
            <CheckCircle2 size={40} className="text-amber-500" />
            <p className="text-lg font-semibold text-gray-900">Thank you!</p>
            <p className="text-sm text-gray-500">Your feedback helps shape what we build next.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What do you enjoy most about StoryQuestor?
                </label>
                <textarea
                  value={likes}
                  onChange={e => setLikes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="The visual editor, branching stories, sharing features…"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What could be better or feels frustrating?
                </label>
                <textarea
                  value={dislikes}
                  onChange={e => setDislikes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Hard to navigate, missing options, confusing UI…"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What features would you love to see?
                </label>
                <textarea
                  value={featureRequests}
                  onChange={e => setFeatureRequests(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Collaboration, audio, mobile app, more story templates…"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 pb-6 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !hasInput}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending…' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
