'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, TrendingUp, Users, Globe, Search, Share2, Mail, Link2, Layers } from 'lucide-react'

interface CategoryRow { category: string; count: number }
interface DomainRow { domain: string; category: string; count: number }
interface DayRow { date: string; count: number }
interface Adventure { id: string; title: string; readCount: number }

interface ReferrerData {
  adventure: Adventure
  byCategory: CategoryRow[]
  byDomain: DomainRow[]
  daily: DayRow[]
  trackedTotal: number
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  direct:   { label: 'Direct',   color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  Icon: Link2    },
  search:   { label: 'Search',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  Icon: Search   },
  social:   { label: 'Social',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  Icon: Share2   },
  referral: { label: 'Referral', color: '#10b981', bg: 'rgba(16,185,129,0.12)',  Icon: Globe    },
  email:    { label: 'Email',    color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   Icon: Mail     },
  internal: { label: 'Internal', color: '#64748b', bg: 'rgba(100,116,139,0.12)', Icon: Layers   },
}

function MiniChart({ daily }: { daily: DayRow[] }) {
  if (!daily.length) return (
    <div className="h-24 flex items-center justify-center text-xs text-slate-400">No data yet</div>
  )

  const max = Math.max(...daily.map(d => d.count), 1)

  // Fill last 60 days even if no rows
  const filledMap = new Map(daily.map(d => [d.date, d.count]))
  const days: { date: string; count: number }[] = []
  for (let i = 59; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 86400000)
    const key = dt.toISOString().slice(0, 10)
    days.push({ date: key, count: filledMap.get(key) ?? 0 })
  }

  const W = 600
  const H = 80
  const barW = W / days.length
  const gap = 1.5

  const pts = days.map((d, i) => {
    const x = i * barW + barW / 2
    const y = H - (d.count / max) * (H - 4)
    return `${x},${y}`
  })
  const area = `M${pts[0]} L${pts.slice(1).join(' L')} L${(days.length - 1) * barW + barW / 2},${H} L${barW / 2},${H} Z`
  const line = `M${pts[0]} L${pts.slice(1).join(' L')}`

  return (
    <div className="w-full" style={{ aspectRatio: '600/80' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-grad)" />
        <path d={line} fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-xl bg-white border border-slate-200">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

export default function ReferrersPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<ReferrerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/referrers/${id}`)
      .then(r => r.ok ? r.json() : r.json().then((e: { error: string }) => { throw new Error(e.error) }))
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="p-8 text-center text-slate-400 text-sm">Loading analytics…</div>
  )
  if (err || !data) return (
    <div className="p-8 text-center text-red-500 text-sm">{err ?? 'Not found'}</div>
  )

  const { adventure, byCategory, byDomain, daily, trackedTotal } = data
  const topCatCount = byCategory[0]?.count ?? 1
  const coverage = adventure.readCount > 0 ? Math.round((trackedTotal / adventure.readCount) * 100) : 0

  const recentTotal = daily.reduce((s, d) => s + d.count, 0)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{adventure.title}</h1>
            <p className="text-sm text-slate-400 mt-0.5">Referrer analytics</p>
          </div>
          <Link
            href={`/play/${adventure.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            <ExternalLink size={11} /> View story
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total reads" value={adventure.readCount.toLocaleString()} />
        <StatCard label="Tracked reads" value={trackedTotal.toLocaleString()} sub={`${coverage}% coverage`} />
        <StatCard label="Last 60 days" value={recentTotal.toLocaleString()} />
        <StatCard label="Sources" value={byCategory.length} sub="distinct channels" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={14} className="text-violet-500" />
              Traffic sources
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {byCategory.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-slate-400">No tracked data yet.</p>
            ) : byCategory.map(row => {
              const meta = CATEGORY_META[row.category] ?? CATEGORY_META.referral
              const Icon = meta.Icon
              const pct = Math.round((row.count / topCatCount) * 100)
              const share = trackedTotal > 0 ? Math.round((row.count / trackedTotal) * 100) : 0
              return (
                <div key={row.category} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: meta.bg }}>
                        <Icon size={12} style={{ color: meta.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs text-slate-400">{share}%</span>
                      <span className="text-sm font-semibold text-slate-900 w-10 text-right tabular-nums">
                        {row.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top domains */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users size={14} className="text-violet-500" />
              Top domains
            </h2>
          </div>
          {byDomain.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-slate-400">No tracked data yet.</p>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b border-slate-100">
                  <tr className="text-xs text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-2.5 font-medium">Domain</th>
                    <th className="text-left px-4 py-2.5 font-medium">Type</th>
                    <th className="text-right px-5 py-2.5 font-medium">Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {byDomain.map((row, i) => {
                    const meta = CATEGORY_META[row.category] ?? CATEGORY_META.referral
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-2.5 font-mono text-xs text-slate-700 truncate max-w-[160px]">
                          {row.domain}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ color: meta.color, background: meta.bg }}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right text-sm font-semibold text-slate-900 tabular-nums">
                          {row.count.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Daily trend */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp size={14} className="text-violet-500" />
            Daily reads (last 60 days)
          </h2>
          <span className="text-xs text-slate-400">Tracked traffic only</span>
        </div>
        <div className="px-5 py-5">
          <MiniChart daily={daily} />
          {daily.length > 0 && (
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{daily[0]?.date}</span>
              <span>{daily[daily.length - 1]?.date}</span>
            </div>
          )}
        </div>
      </div>

      {trackedTotal === 0 && adventure.readCount > 0 && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
          This story has reads but no referrer data yet — tracking started after existing reads occurred. New reads will begin appearing here.
        </div>
      )}
    </div>
  )
}
