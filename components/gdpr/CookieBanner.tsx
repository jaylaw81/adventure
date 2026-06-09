'use client'

import { Cookie } from 'lucide-react'
import { useConsent } from './ConsentProvider'
import { CONSENT_VERSION } from '@/lib/cookieConsent'

export default function CookieBanner() {
  const { consent, ready, updateConsent, openPreferences } = useConsent()

  // Only show when we've read the cookie and no decision has been recorded
  if (!ready || consent !== null) return null

  function acceptAll() {
    updateConsent({ analytics: true, advertising: true, version: CONSENT_VERSION })
  }

  function rejectAll() {
    updateConsent({ analytics: false, advertising: false, version: CONSENT_VERSION })
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 sm:px-6">
      <div
        className="max-w-4xl mx-auto rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(15, 8, 36, 0.97)', backdropFilter: 'blur(12px)' }}
      >
        <div className="px-5 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.25)' }}>
                <Cookie size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">We use cookies</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  We use essential cookies to keep you signed in. With your permission we also use analytics and advertising cookies to improve the site and show relevant content.{' '}
                  <button
                    onClick={openPreferences}
                    className="underline text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Manage preferences
                  </button>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={rejectAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              >
                Reject non-essential
              </button>
              <button
                onClick={openPreferences}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-violet-300 border border-violet-700 hover:bg-violet-900/40 transition-colors"
              >
                Preferences
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
