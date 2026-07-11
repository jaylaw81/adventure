'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, ArrowRight, X } from 'lucide-react'

const STORAGE_KEY = 'sq_demo_bar_dismissed'
const TRIGGER_DELAY_MS = 40_000

export default function DemoConversionBar() {
  const { data: session, status } = useSession()
  const [visible, setVisible] = useState(false)
  const triggered = useRef(false)

  const subscriptionStatus = session?.user?.subscriptionStatus
  const tier = session?.user?.tier
  const shouldSkip = subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || tier === 'organization'

  function trigger() {
    if (triggered.current) return
    if (sessionStorage.getItem(STORAGE_KEY)) return
    triggered.current = true
    setVisible(true)
  }

  useEffect(() => {
    if (status === 'loading') return
    if (shouldSkip) return
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const timer = setTimeout(trigger, TRIGGER_DELAY_MS)
    const onInteract = () => trigger()
    document.addEventListener('sq:demo-interact', onInteract)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('sq:demo-interact', onInteract)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, shouldSkip])

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const ctaHref = session ? '/subscribe' : '/sign-up'
  const ctaLabel = session ? 'Subscribe to save your work' : 'Sign up to save your work'

  return (
    <div
      data-demo-bar
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(90deg, #1a1025 0%, #0f172a 50%, #1a1025 100%)',
        animation: 'slide-up-bar 0.4s cubic-bezier(0.25,1,0.5,1) forwards',
      }}
    >
      {/* Amber shimmer line along top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #f59e0b 35%, #f97316 50%, #f59e0b 65%, transparent 95%)' }}
      />

      {/* Message */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
        >
          <BookOpen size={15} className="text-white" strokeWidth={2} />
        </div>
        <p className="text-sm text-white/80 leading-snug">
          <span className="font-semibold text-white">Love what you're building?</span>
          {' '}Subscribe to save your story and keep creating.
        </p>
      </div>

      {/* CTA + Dismiss */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={ctaHref}
          className="subscribe-cta flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-900 font-bold text-xs whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <span className="shimmer-strip" aria-hidden="true" />
          <span className="relative z-10">{ctaLabel}</span>
          <ArrowRight size={13} className="relative z-10 shrink-0" />
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
