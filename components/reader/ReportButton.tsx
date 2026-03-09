'use client'

import { useState } from 'react'
import { Flag, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { REPORT_REASONS } from '@/lib/reportReasons'

interface Props {
  adventureId: string
}

export default function ReportButton({ adventureId }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const selectedReason = REPORT_REASONS.find(r => r.value === reason)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/adventures/${adventureId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        setDone(true)
      }
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
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        <Flag size={12} />
        Report this story
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-[60vw] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={16} className="text-red-500" />
                <h2 className="text-base font-bold text-gray-900">Report Story</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {done ? (
              <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
                <CheckCircle size={36} className="text-green-500" />
                <p className="font-semibold text-gray-900">Report submitted</p>
                <p className="text-sm text-gray-500">
                  Thank you. Our team will review this story and take appropriate action.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
                <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
                  <p className="text-sm text-gray-500">
                    Select a reason for reporting this story. All reports are reviewed by our team.
                  </p>

                  {/* Reason selection */}
                  <div className="flex flex-col gap-2">
                    {REPORT_REASONS.map(r => (
                      <label
                        key={r.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          reason === r.value
                            ? r.severe
                              ? 'border-red-400 bg-red-50'
                              : 'border-amber-400 bg-amber-50'
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
                          <p className={`text-sm font-medium ${r.severe ? 'text-red-700' : 'text-gray-800'}`}>
                            {r.severe && '⚠️ '}{r.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Severe reason warning */}
                  {selectedReason?.severe && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        This type of content is taken extremely seriously. This report will be flagged
                        as urgent and reviewed as a priority.
                      </p>
                    </div>
                  )}

                  {/* Optional details */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Additional details{reason === 'other' ? ' (required)' : ' (optional)'}
                    </label>
                    <textarea
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder="Describe the issue in more detail…"
                      rows={3}
                      required={reason === 'other'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-2.5 shrink-0">
                  <button
                    type="submit"
                    disabled={!reason || loading}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
                  >
                    {loading ? 'Submitting…' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
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
