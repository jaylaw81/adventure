'use client'

import { useEffect, useState, useRef } from 'react'
import { X, BookOpen, Share2, TrendingUp, Globe, Search, Link2, Mail, Layers, ArrowUpRight } from 'lucide-react'

interface CategoryRow { category: string; count: number }
interface DomainRow { domain: string; category: string; count: number }
interface DayRow { date: string; count: number }

interface AnalyticsData {
  readCount: number
  trackedTotal: number
  socialCount: number
  byCategory: CategoryRow[]
  byDomain: DomainRow[]
  daily: DayRow[]
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  direct:   { label: 'Direct',   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  Icon: Link2   },
  search:   { label: 'Search',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  Icon: Search  },
  social:   { label: 'Social',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  Icon: Share2  },
  referral: { label: 'Referral', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  Icon: Globe   },
  email:    { label: 'Email',    color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   Icon: Mail    },
  internal: { label: 'Internal', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', Icon: Layers  },
}

function SparkLine({ daily }: { daily: DayRow[] }) {
  if (!daily.length) return null

  const filledMap = new Map(daily.map(d => [d.date, d.count]))
  const days: number[] = []
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 86400000)
    days.push(filledMap.get(dt.toISOString().slice(0, 10)) ?? 0)
  }

  const max = Math.max(...days, 1)
  const W = 300
  const H = 52
  const step = W / (days.length - 1)

  const pts = days.map((v, i) => `${i * step},${H - (v / max) * (H - 4)}`)
  const line = `M${pts[0]} L${pts.slice(1).join(' L')}`
  const area = `${line} L${(days.length - 1) * step},${H} L0,${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 52, overflow: 'visible' }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-grad)" />
      <path d={line} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface Props {
  adventureId: string
  title: string
  onClose: () => void
}

export default function StoryAnalyticsModal({ adventureId, title, onClose }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/adventures/${adventureId}/analytics`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [adventureId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const recentTotal = data?.daily.reduce((s, d) => s + d.count, 0) ?? 0
  const topCatCount = data?.byCategory[0]?.count ?? 1

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(15,7,36,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Analytics for ${title}`}
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92dvh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">Story analytics</p>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              Loading analytics…
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              Failed to load analytics.
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-5">

              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <BookOpen size={11} />
                    Total reads
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                    {data.readCount.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Share2 size={11} />
                    Social visits
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                    {data.socialCount.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <TrendingUp size={11} />
                    Last 30 days
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                    {recentTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Sparkline */}
              {data.daily.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Reads — last 30 days</p>
                  <SparkLine daily={data.daily} />
                </div>
              )}

              {/* Traffic sources */}
              {data.byCategory.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-3">Traffic sources</p>
                  <div className="flex flex-col gap-2.5">
                    {data.byCategory.map(row => {
                      const meta = CATEGORY_META[row.category] ?? CATEGORY_META.referral
                      const Icon = meta.Icon
                      const pct = Math.round((row.count / topCatCount) * 100)
                      const share = data.trackedTotal > 0 ? Math.round((row.count / data.trackedTotal) * 100) : 0
                      return (
                        <div key={row.category}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                                style={{ background: meta.bg }}>
                                <Icon size={10} style={{ color: meta.color }} />
                              </div>
                              <span className="text-xs font-medium text-slate-700">{meta.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{share}%</span>
                              <span className="text-xs font-semibold text-slate-800 w-8 text-right tabular-nums">
                                {row.count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Top referrers */}
              {data.byDomain.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Top referrers</p>
                  <div className="flex flex-col divide-y divide-slate-50">
                    {data.byDomain.map((row, i) => {
                      const meta = CATEGORY_META[row.category] ?? CATEGORY_META.referral
                      return (
                        <div key={i} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <ArrowUpRight size={11} style={{ color: meta.color }} className="shrink-0" />
                            <span className="text-xs font-mono text-slate-600 truncate">{row.domain}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-800 tabular-nums shrink-0 ml-3">
                            {row.count.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {data.trackedTotal === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  Referrer data will appear here as readers arrive. Total reads are always tracked.
                </p>
              )}

            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-slate-100 shrink-0 bg-slate-50/60">
          <p className="text-[11px] text-slate-400">
            Analytics available to monthly subscribers · Referrer tracking begins when readers first open your story
          </p>
        </div>
      </div>
    </div>
  )
}
