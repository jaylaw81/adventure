'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { X, Star, CheckCircle2, Sparkles } from 'lucide-react'
import type { SurveyDef } from '@/lib/surveys'

const MIN_USAGE_MS = 10 * 60 * 1000
const SHOW_DELAY_MS = 35_000

interface SurveyState {
  impressionId: string
  survey: SurveyDef
}

/* ── Question input renderers ────────────────────────────────── */

function StarInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hovered, setHovered] = useState(0)
  const selected = parseInt(value || '0', 10)
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(String(n))}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          <Star
            size={32}
            className="transition-colors"
            fill={(hovered || selected) >= n ? '#f59e0b' : 'none'}
            stroke={(hovered || selected) >= n ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1.5}
          />
        </button>
      ))}
      {selected > 0 && (
        <span className="ml-2 text-sm text-amber-600 font-medium">
          {['', 'Not happy', 'Could be better', 'It\'s okay', 'Pretty good', 'Love it!'][selected]}
        </span>
      )}
    </div>
  )
}

function NpsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value ? parseInt(value, 10) : -1
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(String(i))}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
              selected === i
                ? 'text-white shadow-sm scale-105'
                : 'border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700'
            }`}
            style={selected === i ? {
              background: i <= 6
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : i <= 8
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #22c55e, #16a34a)',
            } : undefined}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
    </div>
  )
}

function MultipleChoiceInput({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            value === opt
              ? 'border-violet-400 bg-violet-50 text-violet-800'
              : 'border-gray-200 text-gray-700 hover:border-violet-200 hover:bg-violet-50/50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                value === opt ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
              }`}
            >
              {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            {opt}
          </span>
        </button>
      ))}
    </div>
  )
}

function YesNoMaybeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { label: 'Yes', value: 'yes', active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50' },
    { label: 'Maybe', value: 'maybe', active: 'bg-amber-500 text-white border-amber-500', inactive: 'border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50' },
    { label: 'No', value: 'no', active: 'bg-red-500 text-white border-red-500', inactive: 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50' },
  ]
  return (
    <div className="flex gap-3">
      {opts.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
            value === o.value ? o.active : o.inactive
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  helper,
}: {
  value: string
  onChange: (v: string) => void
  helper?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={3}
      maxLength={2000}
      placeholder={helper}
      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition"
    />
  )
}

/* ── Main modal ──────────────────────────────────────────────── */

export default function SurveyModalV2() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [surveyState, setSurveyState] = useState<SurveyState | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (pathname.startsWith('/admin')) return
    if (!session?.user?.email || !session.user.profileComplete) return

    const FIRST_VISIT_KEY = 'sq_first_visit_v2'
    const stored = localStorage.getItem(FIRST_VISIT_KEY)
    const firstVisit = stored ? parseInt(stored, 10) : Date.now()
    if (!stored) localStorage.setItem(FIRST_VISIT_KEY, String(firstVisit))

    const timeUntilGate = Math.max(0, firstVisit + MIN_USAGE_MS - Date.now())

    let gateTimer: ReturnType<typeof setTimeout>
    let showTimer: ReturnType<typeof setTimeout>

    async function checkAndSchedule() {
      try {
        const res = await fetch('/api/survey/v2')
        if (!res.ok) return
        const data = await res.json()
        if (data.shouldShow) {
          setSurveyState({ impressionId: data.impressionId, survey: data.survey })
          showTimer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS)
        }
      } catch { /* silently skip */ }
    }

    gateTimer = setTimeout(checkAndSchedule, timeUntilGate)
    return () => { clearTimeout(gateTimer); clearTimeout(showTimer) }
  }, [status, session, pathname])

  const handleClose = useCallback(async () => {
    setIsVisible(false)
    if (!surveyState) return
    try {
      await fetch('/api/survey/v2/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impressionId: surveyState.impressionId }),
      })
    } catch { /* best-effort */ }
  }, [surveyState])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!surveyState || submitting) return

    // Check required questions
    const survey = surveyState.survey
    const missing = survey.questions.filter(q => q.required && !answers[q.key])
    if (missing.length > 0) return

    // Skip if no answers at all
    if (Object.keys(answers).length === 0) return

    setSubmitting(true)
    try {
      await fetch('/api/survey/v2/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impressionId: surveyState.impressionId, answers }),
      })
    } catch { /* best-effort */ }
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(() => setIsVisible(false), 2800)
  }, [surveyState, answers, submitting])

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  if (!isVisible || !surveyState) return null

  const { survey } = surveyState
  const hasRequired = survey.questions
    .filter(q => q.required)
    .every(q => !!answers[q.key])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(13,12,26,0.75)' }}
        onClick={submitted ? undefined : handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{survey.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">StoryQuestor · 1 min</p>
            </div>
          </div>
          {!submitted && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 ml-2"
              aria-label="Close survey"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Why this matters callout */}
        {!submitted && (
          <div className="mx-6 mb-4 rounded-xl px-4 py-3 text-xs leading-relaxed text-amber-800 shrink-0"
            style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
            <strong className="font-semibold">Your responses directly shape new features.</strong>{' '}
            {survey.intro}
          </div>
        )}

        {/* Body */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
            <CheckCircle2 size={44} className="text-emerald-500" />
            <p className="text-lg font-bold text-gray-900">Thank you!</p>
            <p className="text-sm text-gray-500 max-w-xs">
              This goes straight into our planning. We genuinely read every response.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex flex-col">
            <div className="px-6 pb-2 flex flex-col gap-6">
              {survey.questions.map((q, i) => (
                <div key={q.key}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2.5 leading-snug">
                    <span className="text-violet-400 text-xs font-bold mr-1.5">{i + 1}.</span>
                    {q.text}
                    {!q.required && (
                      <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
                    )}
                  </label>

                  {q.type === 'stars' && (
                    <StarInput value={answers[q.key] ?? ''} onChange={v => setAnswer(q.key, v)} />
                  )}
                  {q.type === 'nps' && (
                    <NpsInput value={answers[q.key] ?? ''} onChange={v => setAnswer(q.key, v)} />
                  )}
                  {q.type === 'multiple_choice' && q.options && (
                    <MultipleChoiceInput
                      options={q.options}
                      value={answers[q.key] ?? ''}
                      onChange={v => setAnswer(q.key, v)}
                    />
                  )}
                  {q.type === 'yes_no_maybe' && (
                    <YesNoMaybeInput value={answers[q.key] ?? ''} onChange={v => setAnswer(q.key, v)} />
                  )}
                  {q.type === 'text' && (
                    <TextInput
                      value={answers[q.key] ?? ''}
                      onChange={v => setAnswer(q.key, v)}
                      helper={q.helper}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 px-6 py-5 shrink-0 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={submitting || !hasRequired}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
              >
                {submitting ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
