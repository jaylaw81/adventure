'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { registerTools, isWebMcpAvailable } from './registry'
import { discoveryTools, authoringTools } from './tools'

/**
 * Registers StoryQuestor's WebMCP tools with the browser's `modelContext`
 * (Edge 147+, Chrome origin trial). Silently no-ops in browsers without it.
 *
 * Discovery tools are always exposed. Authoring tools appear only once the
 * visitor is signed in — they act as that user via same-origin cookies, and the
 * `/api/*` endpoints do their own ownership checks regardless.
 *
 * Mounted once, app-wide, from `components/Providers.tsx`.
 */
export default function WebMCP() {
  const { status } = useSession()

  useEffect(() => {
    if (!isWebMcpAvailable()) return

    const tools =
      status === 'authenticated'
        ? [...discoveryTools, ...authoringTools]
        : discoveryTools

    return registerTools(tools)
  }, [status])

  return null
}
