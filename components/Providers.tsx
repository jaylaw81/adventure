'use client'

import { SessionProvider } from 'next-auth/react'
import SurveyModalV2 from './SurveyModalV2'
import GoogleAnalytics from './GoogleAnalytics'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GoogleAnalytics />
      {children}
      <SurveyModalV2 />
    </SessionProvider>
  )
}
