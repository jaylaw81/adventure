'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, Send, CheckCircle, AlertCircle, DollarSign, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
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

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
}

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
    setConfig({
      ...config,
      intervals: config.intervals.map(ic => ic.interval === interval ? { ...ic, [key]: value } : ic),
    })
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
    } catch {
      setSaveMsg({ type: 'err', text: 'Network error — try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function sendOffers(emails: string[]) {
    if (emails.length === 0) return
    const isSingle = emails.length === 1
    if (isSingle) setSendingEmail(emails[0])
    else setSendingAll(true)

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
            const m = e.match(/^([^:]+):/)
            if (m) update[m[1]] = 'err'
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

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <RefreshCw size={18} className="animate-spin mr-2" /> Loading…
      </div>
    )
  }
  if (!config) return null

  const enabledCount = config.intervals.filter(i => i.enabled).length
  const eligibleToSend = affected.filter(u => u.offerStatus === 'none' || u.offerStatus === 'expired')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Pricing Configuration</h1>
        <p className="text-slate-400 text-sm">
          Set the price for each billing interval. Changes apply to new subscribers only.
        </p>
      </div>

      {/* Default interval */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <p className="text-sm font-semibold text-slate-300 mb-1">Default billing interval</p>
        <p className="text-xs text-slate-500 mb-4">Pre-selected for new users on the subscribe page.</p>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as BillingInterval[]).map(interval => {
            const ic = config.intervals.find(i => i.interval === interval)
            const isDefault = config.defaultInterval === interval
            const isEnabled = ic?.enabled
            return (
              <button
                key={interval}
                onClick={() => isEnabled && setConfig({ ...config, defaultInterval: interval })}
                disabled={!isEnabled}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors disabled:opacity-30 ${
                  isDefault
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {INTERVAL_LABELS[interval]}
                {isDefault && <span className="ml-1.5 text-[10px] opacity-70">✓ default</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Per-interval config */}
      {config.intervals.map(ic => (
        <div key={ic.interval} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {/* Header row */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">{INTERVAL_LABELS[ic.interval]} billing</h2>
              <p className="text-xs text-slate-500 mt-0.5">/{ic.interval} subscription</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Price input */}
              {ic.enabled && (
                <div className="flex items-center gap-1.5 bg-slate-700 rounded-xl px-3 py-2 w-36 border border-slate-600">
                  <DollarSign size={13} className="text-slate-400 shrink-0" />
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={ic.priceCents / 100}
                    onChange={e => {
                      const v = Math.round(parseFloat(e.target.value || '0') * 100)
                      updateIntervalField(ic.interval, 'priceCents', v)
                    }}
                    className="w-full bg-transparent text-white text-sm font-medium outline-none [appearance:textfield]"
                  />
                  <span className="text-slate-400 text-xs shrink-0">/{ic.interval}</span>
                </div>
              )}
              {/* Enable toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-slate-400">{ic.enabled ? 'Enabled' : 'Disabled'}</span>
                <div
                  onClick={() => {
                    if (ic.enabled && config.defaultInterval === ic.interval) {
                      const other = config.intervals.find(x => x.enabled && x.interval !== ic.interval)
                      if (other) setConfig({ ...config, defaultInterval: other.interval, intervals: config.intervals.map(x => x.interval === ic.interval ? { ...x, enabled: false } : x) })
                      return
                    }
                    updateIntervalField(ic.interval, 'enabled', !ic.enabled)
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${ic.enabled ? 'bg-violet-600' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${ic.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      ))}

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || enabledCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save pricing'}
        </button>
        {saveMsg && (
          <div className={`flex items-center gap-1.5 text-sm ${saveMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
            {saveMsg.type === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {saveMsg.text}
          </div>
        )}
      </div>

      {/* Affected subscribers */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <button
          onClick={() => setShowOffers(v => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-left"
        >
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Price Reduction Offers
              {affected.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-900 rounded-full">
                  {affected.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Subscribers paying more than the current price for their billing interval.
            </p>
          </div>
          {showOffers ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {showOffers && (
          <>
            {affected.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm border-t border-slate-700">
                No subscribers are paying above the current price.
              </div>
            ) : (
              <>
                {eligibleToSend.length > 0 && (
                  <div className="px-6 py-3 border-t border-slate-700 flex items-center justify-between gap-4 bg-slate-700/30">
                    <p className="text-xs text-slate-400">
                      {eligibleToSend.length} subscriber{eligibleToSend.length !== 1 ? 's' : ''} eligible for a lower-price offer.
                    </p>
                    <button
                      onClick={() => sendOffers(eligibleToSend.map(u => u.email))}
                      disabled={sendingAll}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 text-xs font-bold rounded-xl transition-colors"
                    >
                      <Send size={13} />
                      {sendingAll ? 'Sending…' : `Send offer emails to all (${eligibleToSend.length})`}
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-700 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-700">
                        <th className="px-6 py-3 font-medium">Subscriber</th>
                        <th className="px-4 py-3 font-medium">Current</th>
                        <th className="px-4 py-3 font-medium">Offer</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {affected.map(u => {
                        const result = sendResults[u.email]
                        const canSend = u.offerStatus === 'none' || u.offerStatus === 'expired'
                        const isSending = sendingEmail === u.email
                        return (
                          <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-3">
                              <p className="text-slate-200 font-medium">{u.displayName || '—'}</p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-300 font-semibold whitespace-nowrap">
                              {fmtCents(u.currentAmountCents)}/{u.subscriptionInterval}
                            </td>
                            <td className="px-4 py-3 text-amber-400 font-semibold whitespace-nowrap">
                              {fmtCents(u.offeredAmountCents)}/{u.subscriptionInterval}
                            </td>
                            <td className="px-4 py-3">
                              {result === 'sent' ? (
                                <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><CheckCircle size={12} /> Sent</span>
                              ) : result === 'err' ? (
                                <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><AlertCircle size={12} /> Failed</span>
                              ) : u.offerStatus === 'accepted' ? (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">Accepted</span>
                              ) : u.offerStatus === 'pending' ? (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">Email sent</span>
                              ) : u.offerStatus === 'expired' ? (
                                <span className="px-2 py-0.5 bg-slate-600 text-slate-400 text-xs font-semibold rounded-full">Expired</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs font-semibold rounded-full">Not offered</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {u.offerStatus !== 'accepted' && (
                                <button
                                  onClick={() => sendOffers([u.email])}
                                  disabled={isSending}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                    canSend
                                      ? 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'
                                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                  }`}
                                >
                                  <Send size={11} />
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
