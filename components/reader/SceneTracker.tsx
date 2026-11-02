'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

interface Props {
  adventureId: string
  adventureTitle: string
  nodeId: string
  nodeType: string
  /** False for the author and admins, so previews don't skew reader stats. */
  countStats?: boolean
}

/** Counts this scene once and reports the scene the reader came from. A reload of the same scene isn't counted. */
function recordSceneView(adventureId: string, nodeId: string, nodeType: string) {
  const key = `sq_last_scene_${adventureId}`
  let lastScene: string | null = null
  try {
    lastScene = nodeType === 'start' ? null : sessionStorage.getItem(key)
    if (sessionStorage.getItem(key) === nodeId) return
    sessionStorage.setItem(key, nodeId)
  } catch {
    // Private mode etc: still count the view, just without the journey link
  }
  const body = JSON.stringify({ nodeId, fromNodeId: lastScene })
  navigator.sendBeacon?.(`/api/adventures/${adventureId}/scene-view`, body)
}

export default function SceneTracker({ adventureId, adventureTitle, nodeId, nodeType, countStats = true }: Props) {
  useEffect(() => {
    analytics.sceneView(adventureId, nodeId, nodeType)
    if (nodeType === 'start') analytics.storyStart(adventureId, adventureTitle)
    if (nodeType === 'ending') analytics.storyComplete(adventureId, adventureTitle)
    if (countStats) recordSceneView(adventureId, nodeId, nodeType)
  }, [adventureId, adventureTitle, nodeId, nodeType, countStats])

  return null
}
