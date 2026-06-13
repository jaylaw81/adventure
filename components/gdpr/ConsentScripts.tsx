'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useConsent } from './ConsentProvider'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const ADSENSE_ID = 'ca-pub-9068413627358148'

export default function ConsentScripts() {
  const pathname = usePathname()
  const { consent, ready } = useConsent()

  if (!ready || pathname?.startsWith('/admin')) return null

  const analyticsGranted = consent?.analytics === true
  const advertisingGranted = consent?.advertising === true

  return (
    <>
      {/* Google Analytics — only when analytics consent given */}
      {analyticsGranted && GA_ID && process.env.NODE_ENV !== 'development' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('consent', 'update', {
                analytics_storage: 'granted',
              });
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* Google AdSense — only when advertising consent given */}
      {advertisingGranted && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
    </>
  )
}
