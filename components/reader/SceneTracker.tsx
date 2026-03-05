'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

interface Props {
  adventureId: string
  adventureTitle: string
  nodeId: string
  nodeType: string
}

export default function SceneTracker({ adventureId, adventureTitle, nodeId, nodeType }: Props) {
  useEffect(() => {
    analytics.sceneView(adventureId, nodeId, nodeType)
    if (nodeType === 'start') analytics.storyStart(adventureId, adventureTitle)
    if (nodeType === 'ending') analytics.storyComplete(adventureId, adventureTitle)
  }, [adventureId, adventureTitle, nodeId, nodeType])

  return null
}
