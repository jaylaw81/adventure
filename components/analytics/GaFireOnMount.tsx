'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export default function GaFireOnMount({
  name,
  params,
}: {
  name: string
  params?: Record<string, string | number | boolean>
}) {
  useEffect(() => {
    track(name, params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
