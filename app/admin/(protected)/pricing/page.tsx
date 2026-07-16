'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, Send, CheckCircle, AlertCircle, DollarSign, RefreshCw, ChevronDown, ChevronUp, DatabaseZap } from 'lucide-react'
import type { PricingConfig, BillingInterval } from '@/lib/pricing'

interface AffectedUser {
  email: string
  displayName: string
  currentAmountCents: number
  offeredAmountCents: number
  subscriptionInterval: string
  offerStatus: 'none' | 'pending' | 'accepted' | 'expired'
  lastOfferedAt: string | null
}

function fmtCents(c: number) {
  const d = c / 100
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`
}

const INTERVALS: BillingInterval[] = ['week', 'month']
const INTERVAL_LABELS: Record<BillingInterval, string> = { day: 'Daily', week: 'Weekly', month: 'Monthly' }

export default function AdminPricingPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null)
  const [affected, setAffected] = useState<AffectedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [sendingAll, setSendingAll] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendResults, setSendResults] = useState<Record<string, 'sent' | 'err'>>({})
  const [showOffers, setShowOffers] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/pricing')
      const d = await r.json()
      setConfig(d.config)
      setAffected(d.affected)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function updateIntervalField(interval: BillingInterval, key: keyof PricingConfig['intervals'][0], value: unknown) {
    if (!config) return
    setConfig({ ...config, intervals: config.intervals.map(ic => ic.interval === interval ? { ...ic, [key]: value } : ic) })
  }

  function toggleEnabled(interval: BillingInterval) {
    if (!config) return
    const ic = config.intervals.find(x => x.interval === interval)!
    if (ic.enabled && config.defaultInterval === interval) {
      const other = config.intervals.find(x => x.enabled && x.interval !== interval)
      if (other) setConfig({ ...config, defaultInterval: other.interval, intervals: config.intervals.map(x => x.interval === interval ? { ...x, enabled: false } : x) })
      return
    }
    updateIntervalField(interval, 'enabled', !ic.enabled)
  }

  async function save() {
    if (!config) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const r = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const d = await r.json()
      if (!r.ok) { setSaveMsg({ type: 'err', text: d.error ?? 'Save failed' }); return }
      setConfig(d.config)
      setAffected(d.affected)
      setSaveMsg({ type: 'ok', text: 'Pricing saved.' })
      setTimeout(() => setSaveMsg(null), 3000)
    } catch {
      setSaveMsg({ type: 'err', text: 'Network error — try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function sendOffers(emails: string[]) {
    if (emails.length === 0) return
    if (emails.length === 1) setSendingEmail(emails[0]); else setSendingAll(true)
    try {
      const r = await fetch('/api/admin/pricing/send-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })
      const d = await r.json()
      if (r.ok) {
        const update: Record<string, 'sent' | 'err'> = {}
        for (const email of emails) update[email] = 'sent'
        if (d.errors?.length) {
          for (const e of d.errors as string[]) {
            const m = e.match(/^([^:]+):/); if (m) update[m[1]] = 'err'
          }
        }
        setSendResults(prev => ({ ...prev, ...update }))
        await load()
      }
    } finally {
      setSendingEmail(null)
      setSendingAll(false)
    }
  }

  async function syncSubscriptions() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const r = await fetch('/api/admin/pricing/sync-subscriptions', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) {
        setSyncMsg({ type: 'err', text: d.error ?? 'Sync failed' })
      } else {
        setSyncMsg({ type: 'ok', text: `Synced ${d.synced} subscriber${d.synced !== 1 ? 's' : ''} from Stripe.${d.errors?.length ? ` ${d.errors.length} error(s).` : ''}` })
        await load()
      }
    } catch {
      setSyncMsg({ type: 'err', text: 'Network error — try again.' })
    } finally {
      setSyncing(false)
    }
  }

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <RefreshCw size={18} className="animate-spin mr-2" /> Loading…
      </div>
    )
  }
  if (!config) return null

  const enabledCount = config.intervals.filter(i => i.enabled).length
  const eligibleToSend = affected.filter(u => u.offerStatus === 'none' || u.offerStatus === 'expired')

  const displayPreview = (() => {
    const ic = config.intervals.find(i => i.interval === config.displayInterval)
    if (!ic) return null
    const d = ic.priceCents / 100
    return `${Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`}/${ic.interval}`
  })()

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign size={22} className="text-amber-500" />
          Pricing
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage subscription prices and billing options. Changes apply to new subscribers only.
        </p>
      </div>

      {/* Billing intervals — compact table, not separate cards */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Billing intervals</h2>
          <p className="text-xs text-gray-400">Price per cycle · toggle to enable</p>
        </div>

        {config.intervals.map((ic, i) => (
          <div
            key={ic.interval}
            className={`flex items-center gap-4 px-5 py-3.5 ${i < config.intervals.length - 1 ? 'border-b border-gray-100' : ''} ${!ic.enabled ? 'opacity-50' : ''}`}
          >
            {/* Interval name */}
            <div className="w-16 shrink-0">
              <p className="text-sm font-medium text-gray-900">{INTERVAL_LABELS[ic.interval]}</p>
              <p className="text-[11px] text-gray-400">per {ic.interval}</p>
            </div>

            {/* Price input */}
            <div className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 w-36 transition-colors ${
              ic.enabled ? 'border-gray-200 bg-white focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400' : 'border-gray-100 bg-gray-50'
            }`}>
              <DollarSign size={12} className="text-gray-400 shrink-0" />
              <input
                type="number"
                min={0.5}
                step={0.5}
                disabled={!ic.enabled}
                value={ic.priceCents / 100}
                onChange={e => {
                  const v = Math.round(parseFloat(e.target.value || '0') * 100)
                  updateIntervalField(ic.interval, 'priceCents', v)
                }}
                className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none [appearance:textfield] disabled:text-gray-400"
              />
              <span className="text-[11px] text-gray-400 shrink-0">/{ic.interval}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 w-14 text-right">{ic.enabled ? 'Enabled' : 'Disabled'}</span>
              <button
                role="switch"
                aria-checked={ic.enabled}
                onClick={() => toggleEnabled(ic.interval)}
                className={`w-9 h-5 rounded-full relative transition-colors ${ic.enabled ? 'bg-violet-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${ic.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Defaults — two compact label+control rows */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Defaults</h2>
        </div>

        {/* Subscribe page default */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">Subscribe page</p>
            <p className="text-xs text-gray-400">Pre-selected interval for new subscribers</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {INTERVALS.map(interval => {
              const ic = config.intervals.find(i => i.interval === interval)
              const isActive = config.defaultInterval === interval
              return (
                <button
                  key={interval}
                  onClick={() => ic?.enabled && setConfig({ ...config, defaultInterval: interval })}
                  disabled={!ic?.enabled}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors disabled:opacity-30 ${
                    isActive
                      ? 'border-violet-300 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {INTERVAL_LABELS[interval]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Site content display */}
        <div className="px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">Site copy</p>
              <p className="text-xs text-gray-400">
                Shown on homepage, how-to page, and emails
                {displayPreview && (
                  <> — <span className="text-amber-600 font-medium">"Subscribe from {displayPreview}"</span></>
                )}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {INTERVALS.map(interval => {
                const ic = config.intervals.find(i => i.interval === interval)
                const isActive = config.displayInterval === interval
                return (
                  <button
                    key={interval}
                    onClick={() => ic?.enabled && setConfig({ ...config, displayInterval: interval })}
                    disabled={!ic?.enabled}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors disabled:opacity-30 ${
                      isActive
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {INTERVAL_LABELS[interval]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Trial period */}
        <div className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">Trial period</p>
            <p className="text-xs text-gray-400">Free trial days for new subscribers (0 = no trial)</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={0}
              max={90}
              step={1}
              value={config.trialDays ?? 0}
              onChange={e => setConfig({ ...config, trialDays: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
              className="w-16 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-center font-medium text-gray-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 [appearance:textfield]"
            />
            <span className="text-xs text-gray-400">days</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || enabledCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-900 text-sm font-semibold rounded-lg transition-colors"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saveMsg && (
          <div className={`flex items-center gap-1.5 text-sm ${saveMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
            {saveMsg.type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {saveMsg.text}
          </div>
        )}
      </div>

      {/* Price Reduction Offers */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowOffers(v => !v)}
            className="flex-1 flex items-center gap-3 text-left min-w-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Price reduction offers</h2>
                {affected.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                    {affected.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Subscribers paying above the current price for their interval.
              </p>
            </div>
            {showOffers
              ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {/* Sync button */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <button
              onClick={syncSubscriptions}
              disabled={syncing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
              title="Re-fetch subscription data from Stripe to correct stale interval or amount records"
            >
              <DatabaseZap size={12} />
              {syncing ? 'Syncing…' : 'Sync from Stripe'}
            </button>
            {syncMsg && (
              <p className={`text-[11px] font-medium ${syncMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                {syncMsg.text}
              </p>
            )}
          </div>
        </div>

        {showOffers && (
          <>
            {affected.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
                No subscribers are paying above the current price.
              </div>
            ) : (
              <>
                {eligibleToSend.length > 0 && (
                  <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between gap-4 bg-amber-50">
                    <p className="text-xs text-amber-700">
                      {eligibleToSend.length} subscriber{eligibleToSend.length !== 1 ? 's' : ''} eligible for a lower-price offer.
                    </p>
                    <button
                      onClick={() => sendOffers(eligibleToSend.map(u => u.email))}
                      disabled={sendingAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-900 text-xs font-semibold rounded-lg transition-colors shrink-0"
                    >
                      <Send size={12} />
                      {sendingAll ? 'Sending…' : `Send to all (${eligibleToSend.length})`}
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                        <th className="px-5 py-2.5 font-medium">Subscriber</th>
                        <th className="px-4 py-2.5 font-medium">Current</th>
                        <th className="px-4 py-2.5 font-medium">Offered</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {affected.map(u => {
                        const result = sendResults[u.email]
                        const canSend = u.offerStatus === 'none' || u.offerStatus === 'expired'
                        const isSending = sendingEmail === u.email
                        return (
                          <tr key={u.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-gray-900 font-medium text-sm">{u.displayName || '—'}</p>
                              <p className="text-gray-400 text-xs">{u.email}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-semibold text-sm whitespace-nowrap">
                              {fmtCents(u.currentAmountCents)}/{u.subscriptionInterval}
                            </td>
                            <td className="px-4 py-3 text-amber-600 font-semibold text-sm whitespace-nowrap">
                              {fmtCents(u.offeredAmountCents)}/{u.subscriptionInterval}
                            </td>
                            <td className="px-4 py-3">
                              {result === 'sent' ? (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={11} /> Sent</span>
                              ) : result === 'err' ? (
                                <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><AlertCircle size={11} /> Failed</span>
                              ) : u.offerStatus === 'accepted' ? (
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">Accepted</span>
                              ) : u.offerStatus === 'pending' ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">Email sent</span>
                              ) : u.offerStatus === 'expired' ? (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">Expired</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-xs font-semibold rounded-full">Not offered</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {u.offerStatus !== 'accepted' && (
                                <button
                                  onClick={() => sendOffers([u.email])}
                                  disabled={isSending}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                                    canSend
                                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  <Send size={10} />
                                  {isSending ? 'Sending…' : u.offerStatus === 'pending' ? 'Resend' : 'Send offer'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

    </div>
  )
}
