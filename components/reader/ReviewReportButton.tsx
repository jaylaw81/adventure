'use client'

import { useState } from 'react'
import { Flag, X, CheckCircle } from 'lucide-react'
import { REVIEW_REPORT_REASONS } from '@/lib/reviewReportReasons'

interface Props {
  adventureId: string
  reviewId: string
}

export default function ReviewReportButton({ adventureId, reviewId }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/adventures/${adventureId}/reviews/${reviewId}/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, details }),
        }
      )
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Something went wrong')
      else setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => { setDone(false); setReason(''); setDetails(''); setError('') }, 300)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors"
        title="Report this review"
      >
        <Flag size={11} />
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={15} className="text-red-500" />
                <h2 className="text-sm font-bold text-gray-900">Report Review</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {done ? (
              <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle size={32} className="text-green-500" />
                <p className="font-semibold text-gray-900 text-sm">Report submitted</p>
                <p className="text-xs text-gray-500">Our team will review this report.</p>
                <button
                  onClick={handleClose}
                  className="mt-1 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="px-5 py-4 flex flex-col gap-3">
                  <p className="text-xs text-gray-500">Why are you reporting this review?</p>
                  <div className="flex flex-col gap-1.5">
                    {REVIEW_REPORT_REASONS.map(r => (
                      <label
                        key={r.value}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          reason === r.value
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          className="mt-0.5 shrink-0 accent-amber-500"
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-800">{r.label}</p>
                          <p className="text-xs text-gray-400">{r.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Details{reason === 'other' ? ' (required)' : ' (optional)'}
                    </label>
                    <textarea
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder="Provide more context…"
                      rows={2}
                      required={reason === 'other'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
                <div className="px-5 pb-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={!reason || loading}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                  >
                    {loading ? 'Submitting…' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
