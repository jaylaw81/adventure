'use client'

import { SessionProvider } from 'next-auth/react'
import SurveyModalV2 from './SurveyModalV2'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <SurveyModalV2 />
    </SessionProvider>
  )
}
