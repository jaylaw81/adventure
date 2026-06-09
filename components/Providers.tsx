'use client'

import { SessionProvider } from 'next-auth/react'
import SurveyModalV2 from './SurveyModalV2'
import { ConsentProvider } from './gdpr/ConsentProvider'
import CookieBanner from './gdpr/CookieBanner'
import CookiePreferencesModal from './gdpr/CookiePreferencesModal'
import ConsentScripts from './gdpr/ConsentScripts'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConsentProvider>
        <ConsentScripts />
        {children}
        <SurveyModalV2 />
        <CookieBanner />
        <CookiePreferencesModal />
      </ConsentProvider>
    </SessionProvider>
  )
}
