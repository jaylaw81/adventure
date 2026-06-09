'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { readConsentCookie, writeConsentCookie, type ConsentPreferences } from '@/lib/cookieConsent'

type ConsentContextValue = {
  consent: ConsentPreferences | null  // null = not yet decided (show banner)
  ready: boolean
  updateConsent: (prefs: ConsentPreferences) => void
  preferencesOpen: boolean
  openPreferences: () => void
  closePreferences: () => void
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  ready: false,
  updateConsent: () => {},
  preferencesOpen: false,
  openPreferences: () => {},
  closePreferences: () => {},
})

export function useConsent() {
  return useContext(ConsentContext)
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null)
  const [ready, setReady] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    setConsent(readConsentCookie())
    setReady(true)
  }, [])

  const updateConsent = useCallback((prefs: ConsentPreferences) => {
    writeConsentCookie(prefs)
    setConsent(prefs)

    // Propagate to Google Consent Mode
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.advertising ? 'granted' : 'denied',
        ad_user_data: prefs.advertising ? 'granted' : 'denied',
        ad_personalization: prefs.advertising ? 'granted' : 'denied',
      })
    }
  }, [])

  return (
    <ConsentContext.Provider value={{
      consent,
      ready,
      updateConsent,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }}>
      {children}
    </ConsentContext.Provider>
  )
}
