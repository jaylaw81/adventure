'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scroll, Sparkles, Zap, Heart } from 'lucide-react'

const PRESETS = [
  { cents: 200, label: '$2' },
  { cents: 500, label: '$5' },
  { cents: 1000, label: '$10' },
  { cents: 2000, label: '$20' },
]

interface Props {
  hasTrial: boolean
  trialEndsAt: string | null
  gracePeriodEndsAt: string | null
}

export default function SubscribeForm({ hasTrial, trialEndsAt, gracePeriodEndsAt }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<number>(500)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amountCents = useCustom
    ? Math.round(parseFloat(custom || '0') * 100)
    : selected

  const amountDollars = (amountCents / 100).toFixed(2)
  const valid = amountCents >= 200

  const deadlineDate = trialEndsAt
    ? new Date(trialEndsAt)
    : gracePeriodEndsAt
      ? new Date(gracePeriodEndsAt)
      : null

  const deadlineLabel = deadlineDate
    ? deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null

  async function handleSubscribe() {
    if (!valid) { setError('Minimum amount is $2.00'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }
      router.push(data.url)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
          >
            <Scroll size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Support StoryQuestor
          </h1>
          <p className="text-violet-300 text-sm leading-relaxed max-w-sm mx-auto">
            Choose the amount that works for you — every contribution keeps the platform running and new features coming.
          </p>
        </div>

        {/* Grace / trial notice */}
        {deadlineLabel && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm text-center">
            Your free access ends on <strong>{deadlineLabel}</strong> — subscribe to keep creating.
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7 flex flex-col gap-6">

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { icon: Sparkles, text: 'Create unlimited branching stories' },
              { icon: Zap, text: 'Full access to the story editor' },
              { icon: Heart, text: 'Support an indie creator platform' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-gray-700">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-violet-600" />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100" />

          {/* Amount picker */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Choose your monthly amount</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESETS.map(({ cents, label }) => (
                <button
                  key={cents}
                  onClick={() => { setSelected(cents); setUseCustom(false); setError('') }}
                  className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    !useCustom && selected === cents
                      ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-violet-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <button
              onClick={() => { setUseCustom(true); setError('') }}
              className={`w-full text-sm py-2 rounded-xl border-2 transition-all font-medium ${
                useCustom
                  ? 'border-violet-400 bg-violet-50 text-violet-700'
                  : 'border-dashed border-gray-300 text-gray-500 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {useCustom ? 'Custom amount' : '+ Enter custom amount'}
            </button>

            {useCustom && (
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                <input
                  type="number"
                  min="2"
                  step="1"
                  value={custom}
                  onChange={e => { setCustom(e.target.value); setError('') }}
                  placeholder="2"
                  autoFocus
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">/month</span>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading || !valid}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 hover:brightness-110 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            {loading
              ? 'Redirecting…'
              : hasTrial
                ? `Start 7-day free trial · $${amountDollars}/mo after`
                : `Subscribe for $${amountDollars}/month`}
          </button>

          <p className="text-center text-xs text-gray-400">
            Cancel or pause anytime from your profile. Payments processed securely by Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
