'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={star <= (hovered || value) ? 'text-amber-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent!',
}

interface Props {
  adventureId: string
}

export default function ReviewForm({ adventureId }: Props) {
  const { data: session, status } = useSession()
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.email) { setLoading(false); return }
    fetch(`/api/adventures/${adventureId}/reviews`)
      .then(r => r.json())
      .then(data => {
        if (data.userReview) {
          setRating(data.userReview.rating)
          setReviewText(data.userReview.reviewText ?? '')
          setDone(true)
        }
      })
      .finally(() => setLoading(false))
  }, [adventureId, session, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/adventures/${adventureId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        setDone(true)
        setIsEdit(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) return null

  if (!session) {
    return (
      <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5 text-center">
        <p className="text-sm text-gray-500 mb-3">Enjoyed the story? Leave a rating!</p>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Sign in to rate
        </Link>
      </div>
    )
  }

  if (done && !isEdit) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Your rating: {rating}/5 — {RATING_LABELS[rating]}</p>
              {reviewText && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">&ldquo;{reviewText}&rdquo;</p>}
            </div>
          </div>
          <button
            onClick={() => setIsEdit(true)}
            className="shrink-0 text-xs text-amber-600 hover:underline font-medium"
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-1">
        {isEdit ? 'Update your rating' : 'Rate this story'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">How did you enjoy this adventure?</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="text-sm font-medium text-amber-600">{RATING_LABELS[rating]}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Review <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this story…"
            rows={3}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!rating || saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Update' : 'Submit Rating'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={() => setIsEdit(false)}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
