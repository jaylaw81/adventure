'use client'

import { useEffect, useState } from 'react'
import ReviewReportButton from './ReviewReportButton'

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
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-base leading-none">
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

export default function ReviewsSection({ adventureId }: Props) {
  const [data, setData] = useState<{ reviews: Review[]; avgRating: number | null; totalCount: number } | null>(null)

  useEffect(() => {
    fetch(`/api/adventures/${adventureId}/reviews`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.reviews)) setData(d) })
  }, [adventureId])

  if (!data || data.totalCount === 0) return null

  return (
    <div className="mt-8">
      {/* Aggregate */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl font-extrabold text-gray-900">{data.avgRating?.toFixed(1)}</span>
        <div>
          <Stars rating={data.avgRating ?? 0} />
          <p className="text-xs text-gray-400 mt-0.5">
            {data.totalCount} {data.totalCount === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      </div>

      {/* Review list */}
      <div className="flex flex-col gap-4">
        {data.reviews.filter(r => r.reviewText).map(review => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{displayName(review)}</span>
                <Stars rating={review.rating} />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <ReviewReportButton adventureId={adventureId} reviewId={review.id} />
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{review.reviewText}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
