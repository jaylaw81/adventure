'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign, TrendingUp, Users, BarChart3,
  CheckCircle2, Clock, AlertTriangle, CreditCard,
  Building2, Gift, ArrowRight,
} from 'lucide-react'
import { formatCents } from '@/lib/pricing'

interface EarningsData {
  mrrCents: number
  arrCents: number
  projectedMrrCents: number
  projectedArrCents: number
  activeCount: number
  trialCount: number
  graceCount: number
  needsSetupCount: number
  issuesCount: number
  orgCount: number
  grandfatheredCount: number
  totalUsers: number
  avgAmountCents: number
  avgTrialAmountCents: number
  buckets: Record<string, number>
  activeSubscribers: { email: string; displayName: string; amountCents: number; interval: string; monthlyCents: number; status: string }[]
}

// MRR/ARR and averages are monthly-equivalent figures normalized across billing intervals — always "/mo".
function fmt(cents: number) {
  return formatCents(Math.round(cents))
}

function StatCard({
  label, value, sub, icon, accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AdminEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/earnings')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
  }
  if (!data) {
    return <div className="p-8 text-center text-slate-400 text-sm">Failed to load earnings data.</div>
  }

  const maxBucket = Math.max(...Object.values(data.buckets), 1)

  const statusRows = [
    {
      label: 'Active subscribers',
      count: data.activeCount,
      revenue: fmt(data.mrrCents) + '/mo',
      icon: <CheckCircle2 size={14} />,
      chipClass: 'bg-green-100 text-green-700',
    },
    {
      label: 'In trial',
      count: data.trialCount,
      revenue: data.trialCount > 0 ? `avg ${fmt(data.avgTrialAmountCents)}/mo at conversion` : '—',
      icon: <Clock size={14} />,
      chipClass: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Grace period',
      count: data.graceCount,
      revenue: 'at risk',
      icon: <AlertTriangle size={14} />,
      chipClass: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Billing issues',
      count: data.issuesCount,
      revenue: 'churned',
      icon: <AlertTriangle size={14} />,
      chipClass: 'bg-red-100 text-red-700',
    },
    {
      label: 'Needs setup',
      count: data.needsSetupCount,
      revenue: '—',
      icon: <CreditCard size={14} />,
      chipClass: 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Grandfathered',
      count: data.grandfatheredCount,
      revenue: 'free',
      icon: <Gift size={14} />,
      chipClass: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Organizations',
      count: data.orgCount,
      revenue: 'org billing',
      icon: <Building2 size={14} />,
      chipClass: 'bg-amber-100 text-amber-700',
    },
  ].filter(r => r.count > 0)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
        <p className="text-slate-500 text-sm mt-1">Projected monthly and annual revenue based on current subscribers</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="MRR"
          value={fmt(data.mrrCents)}
          sub="current active only"
          icon={<DollarSign size={18} className="text-green-700" />}
          accent="bg-green-100"
        />
        <StatCard
          label="ARR"
          value={fmt(data.arrCents)}
          sub="MRR × 12"
          icon={<TrendingUp size={18} className="text-blue-700" />}
          accent="bg-blue-100"
        />
        <StatCard
          label="Projected MRR"
          value={fmt(data.projectedMrrCents)}
          sub={`if ${data.trialCount} trials convert`}
          icon={<TrendingUp size={18} className="text-violet-700" />}
          accent="bg-violet-100"
        />
        <StatCard
          label="Active subscribers"
          value={String(data.activeCount)}
          sub={`avg ${fmt(data.avgAmountCents)}/mo`}
          icon={<Users size={18} className="text-slate-700" />}
          accent="bg-slate-100"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Revenue distribution</h2>
            <span className="text-xs text-slate-400">(active subscribers)</span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(data.buckets).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 w-14 shrink-0">{label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${(count / maxBucket) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-6 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">User status breakdown</h2>
          <div className="space-y-2">
            {statusRows.map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${row.chipClass}`}>
                    {row.icon}
                    {row.count}
                  </span>
                  <span className="text-sm text-slate-700">{row.label}</span>
                </div>
                <span className="text-xs text-slate-400">{row.revenue}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <span>Total users</span>
            <span className="font-semibold text-slate-600">{data.totalUsers}</span>
          </div>
        </div>
      </div>

      {/* Projected uplift callout */}
      {data.trialCount > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          <TrendingUp size={20} className="text-violet-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-violet-900">
              +{fmt(data.projectedMrrCents - data.mrrCents)}/mo potential uplift
            </p>
            <p className="text-xs text-violet-600 mt-0.5">
              {data.trialCount} trial {data.trialCount === 1 ? 'user' : 'users'} averaging {fmt(data.avgTrialAmountCents)}/mo — projected ARR{' '}
              <span className="font-semibold">{fmt(data.projectedArrCents)}</span> if all convert
            </p>
          </div>
          <ArrowRight size={16} className="text-violet-400 shrink-0" />
        </div>
      )}

      {/* Active subscribers table */}
      {data.activeSubscribers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Active subscribers</h2>
            <span className="text-xs text-slate-400">{data.activeSubscribers.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 font-semibold">User</th>
                  <th className="text-right px-5 py-2.5 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.activeSubscribers.map(s => (
                  <tr key={s.email} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{s.displayName || '(no name)'}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.email}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-semibold text-slate-900">{formatCents(s.amountCents)}</span>
                      <span className="text-xs text-slate-400">/{s.interval}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td className="px-5 py-3 text-sm font-semibold text-slate-700">Total MRR</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{fmt(data.mrrCents)}/mo</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {data.activeSubscribers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm shadow-sm">
          No active subscribers yet.
        </div>
      )}
    </div>
  )
}
