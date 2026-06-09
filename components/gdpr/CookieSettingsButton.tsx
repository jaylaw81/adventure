'use client'

import { useConsent } from './ConsentProvider'

interface Props {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function CookieSettingsButton({ className, style, children }: Props) {
  const { openPreferences } = useConsent()
  return (
    <button onClick={openPreferences} className={className} style={style}>
      {children ?? 'Cookie Preferences'}
    </button>
  )
}
