'use client'

import { useState, useEffect } from 'react'
import { X, ShieldCheck, BarChart2, Megaphone } from 'lucide-react'
import { useConsent } from './ConsentProvider'
import { CONSENT_VERSION } from '@/lib/cookieConsent'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  id: string
}

function Toggle({ checked, onChange, disabled, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        checked ? 'bg-violet-600' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

interface Category {
  key: 'analytics' | 'advertising'
  icon: React.ReactNode
  label: string
  description: string
  detail: string
}

const CATEGORIES: Category[] = [
  {
    key: 'analytics',
    icon: <BarChart2 size={18} className="text-violet-500" />,
    label: 'Analytics',
    description: 'Google Analytics 4',
    detail: 'Helps us understand how visitors use the site so we can improve the experience. No personal data is shared with third parties for analytics.',
  },
  {
    key: 'advertising',
    icon: <Megaphone size={18} className="text-violet-500" />,
    label: 'Advertising',
    description: 'Google AdSense',
    detail: 'Allows Google to show relevant ads on public story pages. AdSense may use cookies across sites to personalise the ads you see.',
  },
]

export default function CookiePreferencesModal() {
  const { consent, ready, updateConsent, preferencesOpen, closePreferences } = useConsent()
  const [analytics, setAnalytics] = useState(false)
  const [advertising, setAdvertising] = useState(false)

  // Sync local toggles whenever the modal opens or consent changes
  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent?.analytics ?? false)
      setAdvertising(consent?.advertising ?? false)
    }
  }, [preferencesOpen, consent])

  if (!ready || !preferencesOpen) return null

  function handleSave() {
    updateConsent({ analytics, advertising, version: CONSENT_VERSION })
    closePreferences()
  }

  function handleAcceptAll() {
    updateConsent({ analytics: true, advertising: true, version: CONSENT_VERSION })
    closePreferences()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(15,8,36,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) closePreferences() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id="cookie-prefs-title" className="text-base font-bold text-slate-900">Cookie Preferences</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage how we use cookies on your device</p>
          </div>
          <button
            onClick={closePreferences}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 flex flex-col gap-4">
          {/* Necessary — always on */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
            <div className="mt-0.5 shrink-0">
              <ShieldCheck size={18} className="text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Necessary</p>
                  <p className="text-xs text-slate-400">Session & authentication cookies</p>
                </div>
                <div className="shrink-0">
                  <Toggle id="toggle-necessary" checked disabled onChange={() => {}} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Required for the site to function. Keeps you signed in and secures your session. Cannot be disabled.
              </p>
            </div>
          </div>

          {CATEGORIES.map(cat => {
            const value = cat.key === 'analytics' ? analytics : advertising
            const setter = cat.key === 'analytics' ? setAnalytics : setAdvertising
            return (
              <div key={cat.key} className="flex items-start gap-3 p-4 border border-slate-100 rounded-xl hover:border-violet-200 transition-colors">
                <div className="mt-0.5 shrink-0">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label htmlFor={`toggle-${cat.key}`} className="text-sm font-semibold text-slate-800 cursor-pointer">
                        {cat.label}
                      </label>
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    </div>
                    <div className="shrink-0">
                      <Toggle
                        id={`toggle-${cat.key}`}
                        checked={value}
                        onChange={setter}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{cat.detail}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            Save Preferences
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-violet-200 text-violet-700 hover:bg-violet-50 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
