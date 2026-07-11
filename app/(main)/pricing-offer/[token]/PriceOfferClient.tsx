'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface Props {
  token: string
  currentAmountCents: number
  offeredAmountCents: number
  expiresAt: string
}

function fmtCents(c: number) {
  const d = c / 100
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`
}

export default function PriceOfferClient({ token, currentAmountCents, offeredAmountCents, expiresAt }: Props) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  async function accept() {
    setAccepting(true)
    setError('')
    try {
      const r = await fetch(`/api/pricing-offer/${token}`, { method: 'POST' })
      if (!r.ok) {
        const d = await r.json()
        setError(d.error ?? 'Something went wrong. Please try again.')
        return
      }
      setAccepted(true)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setAccepting(false)
    }
  }

  if (accepted) {
    return (
      <div
        className="flex items-center justify-center px-4 py-20 -mt-16"
        style={{ minHeight: 'calc(100vh + 4rem)', background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
          >
            <CheckCircle size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Done! Lower rate applied.
          </h1>
          <p className="text-violet-300/80 text-sm leading-relaxed mb-6">
            Your subscription has been updated to <strong className="text-white">{fmtCents(offeredAmountCents)}/week</strong>.
            The change takes effect on your next billing cycle.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-gray-900 font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            View your profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center px-4 py-16 -mt-16 relative overflow-hidden"
      style={{ minHeight: 'calc(100vh + 4rem)', background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 70%)', transform: 'translate(-35%, 35%)' }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Icon */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
          >
            <BookOpen size={28} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            We've lowered our prices
          </h1>
          <p className="text-violet-300/80 text-sm leading-relaxed max-w-xs mx-auto">
            As a valued subscriber, you qualify for our new lower rate. Accept below to save immediately.
          </p>
        </div>

        {/* Price card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
          <div className="p-7">

            {/* Comparison */}
            <div className="flex items-center gap-4 mb-7">
              <div className="flex-1 text-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your current plan</p>
                <p className="text-3xl font-extrabold text-gray-400" style={{ letterSpacing: '-0.03em' }}>{fmtCents(currentAmountCents)}</p>
                <p className="text-xs text-gray-400 mt-0.5">/week</p>
              </div>
              <div className="text-gray-300 shrink-0">
                <ArrowRight size={20} />
              </div>
              <div className="flex-1 text-center rounded-xl p-4 border-2 border-amber-400 bg-amber-50">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">New offer</p>
                <p className="text-3xl font-extrabold text-amber-700" style={{ letterSpacing: '-0.03em' }}>{fmtCents(offeredAmountCents)}</p>
                <p className="text-xs text-amber-600 mt-0.5">/week</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">
              Your story access stays exactly the same — you just pay less.
              The change applies on your next billing cycle.
            </p>

            {error && (
              <p className="text-xs text-red-500 text-center mb-4">{error}</p>
            )}

            <button
              onClick={accept}
              disabled={accepting}
              className="subscribe-cta w-full py-3.5 rounded-xl text-gray-900 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <span className="shimmer-strip" aria-hidden="true" />
              <span className="relative z-10">
                {accepting ? 'Applying…' : `Accept lower price: ${fmtCents(offeredAmountCents)}/week →`}
              </span>
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Offer expires {expiryDate}.{' '}
              <Link href="/profile" className="text-violet-500 hover:text-violet-700 underline underline-offset-2">
                Keep my current plan
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
