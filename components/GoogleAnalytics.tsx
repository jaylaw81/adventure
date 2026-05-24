'use client'

import Script from 'next/script'
import { useSession } from 'next-auth/react'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  const { data: session } = useSession()

  // Skip on localhost and for the admin account
  if (!GA_ID) return null
  if (process.env.NODE_ENV === 'development') return null
  if (session?.user?.isAdmin) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
