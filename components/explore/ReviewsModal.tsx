'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Review {
  id: string
  rating: number
  reviewText: string | null
  reviewerEmail: string
  reviewerName: string | null
  createdAt: string
}

interface Props {
  adventureId: string
  adventureTitle: string
  onClose: () => void
}

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <span className={`inline-flex leading-none ${cls}`}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

function displayName(review: Review) {
  if (review.reviewerName?.trim()) return review.reviewerName
  return review.reviewerEmail.split('@')[0]
}

export default function ReviewsModal({ adventureId, adventureTitle, onClose }: Props) {
  const [data, setData] = useState<{ reviews: Review[]; avgRating: number | null; totalCount: number } | null>(null)

  useEffect(() => {
    fetch(`/api/adventures/${adventureId}/reviews`)
      .then(r => r.json())
      .then(setData)
  }, [adventureId])

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const textReviews = data?.reviews.filter(r => r.reviewText) ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Reviews</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{adventureTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-4 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {!data ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
          ) : data.totalCount === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No reviews yet.</div>
          ) : (
            <>
              {/* Aggregate */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-gray-900 leading-none">{data.avgRating?.toFixed(1)}</p>
                  <p className="text-xs text-gray-400 mt-1">out of 5</p>
                </div>
                <div>
                  <Stars rating={data.avgRating ?? 0} />
                  <p className="text-sm text-gray-500 mt-1">
                    {data.totalCount} {data.totalCount === 1 ? 'rating' : 'ratings'}
                    {textReviews.length > 0 && ` · ${textReviews.length} written ${textReviews.length === 1 ? 'review' : 'reviews'}`}
                  </p>
                </div>
              </div>

              {/* Written reviews */}
              {textReviews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No written reviews yet — only star ratings.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {textReviews.map(review => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{displayName(review)}</span>
                          <Stars rating={review.rating} size="sm" />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
