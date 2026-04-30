'use client'

import { SessionProvider } from 'next-auth/react'
import SurveyModal from './SurveyModal'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <SurveyModal />
    </SessionProvider>
  )
}
