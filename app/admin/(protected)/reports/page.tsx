'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Play, AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink, EyeOff } from 'lucide-react'
import { REPORT_REASONS } from '@/lib/reportReasons'
import { REVIEW_REPORT_REASONS } from '@/lib/reviewReportReasons'

type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
type ReportType = 'story' | 'review'

interface StoryReport {
  id: string
  adventureId: string
  adventureTitle: string | null
  reporterEmail: string | null
  reason: string
  details: string | null
  status: ReportStatus
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

interface ReviewReport {
  id: string
  reviewId: string
  adventureId: string
  adventureTitle: string | null
  reviewText: string | null
  reviewRating: number | null
  reviewHidden: boolean | null
  reporterEmail: string | null
  reason: string
  details: string | null
  status: ReportStatus
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

const STATUS_TABS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
]

const STATUS_STYLE: Record<ReportStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-500',
}

const STATUS_ICON: Record<ReportStatus, React.ReactNode> = {
  pending: <Clock size={12} />,
  reviewed: <CheckCircle size={12} />,
  dismissed: <XCircle size={12} />,
}

function storyReasonLabel(value: string) {
  return REPORT_REASONS.find(r => r.value === value)?.label ?? value
}

function storyReasonSevere(value: string) {
  return REPORT_REASONS.find(r => r.value === value)?.severe ?? false
}

function reviewReasonLabel(value: string) {
  return REVIEW_REPORT_REASONS.find(r => r.value === value)?.label ?? value
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-sm leading-none">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('story')
  const [storyReports, setStoryReports] = useState<StoryReport[]>([])
  const [reviewReports, setReviewReports] = useState<ReviewReport[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ReportStatus | 'all'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/reports').then(r => r.json()),
      fetch('/api/admin/review-reports').then(r => r.json()),
    ]).then(([stories, reviews]) => {
      setStoryReports(stories)
      setReviewReports(reviews)
      setLoading(false)
    })
  }, [])

  const activeReports = reportType === 'story' ? storyReports : reviewReports
  const filtered = useMemo(() =>
    tab === 'all' ? activeReports : activeReports.filter(r => r.status === tab),
    [activeReports, tab]
  )

  const pendingStory = useMemo(() => storyReports.filter(r => r.status === 'pending').length, [storyReports])
  const pendingReview = useMemo(() => reviewReports.filter(r => r.status === 'pending').length, [reviewReports])
  const pendingCount = reportType === 'story' ? pendingStory : pendingReview

  const updateStoryStatus = async (id: string, status: ReportStatus) => {
    setSaving(true)
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNote }),
    })
    if (res.ok) {
      setStoryReports(prev => prev.map(r => r.id === id ? { ...r, status, reviewNote, reviewedAt: new Date().toISOString() } : r))
      setReviewingId(null)
      setReviewNote('')
    }
    setSaving(false)
  }

  const updateReviewStatus = async (id: string, status: ReportStatus, hideReview = false) => {
    setSaving(true)
    const res = await fetch(`/api/admin/review-reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNote, hideReview }),
    })
    if (res.ok) {
      setReviewReports(prev => prev.map(r =>
        r.id === id
          ? { ...r, status, reviewNote, reviewedAt: new Date().toISOString(), reviewHidden: hideReview ? true : r.reviewHidden }
          : r
      ))
      setReviewingId(null)
      setReviewNote('')
    }
    setSaving(false)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">User-submitted reports requiring review</p>
      </div>

      {/* Report type toggle */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setReportType('story'); setTab('pending'); setReviewingId(null) }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            reportType === 'story' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Story Reports
          {pendingStory > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
              {pendingStory}
            </span>
          )}
        </button>
        <button
          onClick={() => { setReportType('review'); setTab('pending'); setReviewingId(null) }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            reportType === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Review Reports
          {pendingReview > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
              {pendingReview}
            </span>
          )}
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.value === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">No reports in this category.</div>
      ) : reportType === 'story' ? (
        /* ── Story Reports ── */
        <div className="flex flex-col gap-4">
          {(filtered as StoryReport[]).map(report => (
            <div
              key={report.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                storyReasonSevere(report.reason) && report.status === 'pending' ? 'border-red-300' : 'border-slate-200'
              }`}
            >
              {storyReasonSevere(report.reason) && report.status === 'pending' && (
                <div className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-xs font-bold">
                  <AlertTriangle size={13} />
                  URGENT — {storyReasonLabel(report.reason).toUpperCase()}
                </div>
              )}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[report.status]}`}>
                        {STATUS_ICON[report.status]}
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        storyReasonSevere(report.reason) ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {storyReasonLabel(report.reason)}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      Story: {report.adventureTitle ?? <span className="italic text-slate-400">Deleted</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reporter: {report.reporterEmail ?? <span className="italic">Anonymous</span>}
                    </p>
                    {report.details && (
                      <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        &ldquo;{report.details}&rdquo;
                      </p>
                    )}
                    {report.reviewNote && (
                      <p className="mt-2 text-xs text-slate-500 italic">Admin note: {report.reviewNote}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {report.adventureTitle && (
                      <Link href={`/play/${report.adventureId}`} target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors">
                        <Play size={11} /> Play Story
                      </Link>
                    )}
                    {report.adventureTitle && (
                      <Link href={`/edit/${report.adventureId}`} target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors">
                        <ExternalLink size={11} /> View Editor
                      </Link>
                    )}
                    {report.status === 'pending' && (
                      <button onClick={() => { setReviewingId(report.id); setReviewNote('') }}
                        className="text-xs text-slate-400 hover:text-slate-600 underline">
                        Review…
                      </button>
                    )}
                  </div>
                </div>
                {reviewingId === report.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-700 mb-2">Add an optional note, then mark as:</p>
                    <textarea
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="e.g. Content removed, warning issued…"
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none mb-3"
                    />
                    <div className="flex gap-2">
                      <button disabled={saving} onClick={() => updateStoryStatus(report.id, 'reviewed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <CheckCircle size={13} /> Mark Reviewed
                      </button>
                      <button disabled={saving} onClick={() => updateStoryStatus(report.id, 'dismissed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <XCircle size={13} /> Dismiss
                      </button>
                      <button onClick={() => setReviewingId(null)} className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Review Reports ── */
        <div className="flex flex-col gap-4">
          {(filtered as ReviewReport[]).map(report => (
            <div key={report.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
              report.status === 'pending' ? 'border-slate-200' : 'border-slate-100'
            }`}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[report.status]}`}>
                        {STATUS_ICON[report.status]}
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {reviewReasonLabel(report.reason)}
                      </span>
                      {report.reviewHidden && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          <EyeOff size={10} /> Hidden
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900">
                      Story: {report.adventureTitle ?? <span className="italic text-slate-400">Deleted</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reporter: {report.reporterEmail ?? <span className="italic">Anonymous</span>}
                    </p>

                    {/* The review being reported */}
                    {report.reviewText && (
                      <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500 font-medium">Reported review</span>
                          {report.reviewRating && <Stars rating={report.reviewRating} />}
                        </div>
                        <p className="text-sm text-slate-600 italic">&ldquo;{report.reviewText}&rdquo;</p>
                      </div>
                    )}

                    {report.details && (
                      <p className="mt-2 text-xs text-slate-500 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                        Report details: &ldquo;{report.details}&rdquo;
                      </p>
                    )}
                    {report.reviewNote && (
                      <p className="mt-2 text-xs text-slate-500 italic">Admin note: {report.reviewNote}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {report.adventureTitle && (
                      <Link href={`/play/${report.adventureId}`} target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors">
                        <Play size={11} /> Play Story
                      </Link>
                    )}
                    {report.status === 'pending' && (
                      <button onClick={() => { setReviewingId(report.id); setReviewNote('') }}
                        className="text-xs text-slate-400 hover:text-slate-600 underline">
                        Review…
                      </button>
                    )}
                  </div>
                </div>

                {reviewingId === report.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-700 mb-2">Add an optional note, then choose an action:</p>
                    <textarea
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="e.g. Review contained hate speech…"
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none mb-3"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {!report.reviewHidden && (
                        <button disabled={saving} onClick={() => updateReviewStatus(report.id, 'reviewed', true)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                          <EyeOff size={13} /> Hide Review &amp; Mark Reviewed
                        </button>
                      )}
                      <button disabled={saving} onClick={() => updateReviewStatus(report.id, 'reviewed', false)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <CheckCircle size={13} /> Mark Reviewed
                      </button>
                      <button disabled={saving} onClick={() => updateReviewStatus(report.id, 'dismissed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <XCircle size={13} /> Dismiss
                      </button>
                      <button onClick={() => setReviewingId(null)} className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
