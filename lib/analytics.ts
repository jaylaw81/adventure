declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void
  }
}

export function track(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', event, params)
}

// --- Reader ---
export const analytics = {
  storyStart: (adventureId: string, adventureTitle: string) =>
    track('story_start', { adventure_id: adventureId, adventure_title: adventureTitle }),

  sceneView: (adventureId: string, nodeId: string, nodeType: string) =>
    track('scene_view', { adventure_id: adventureId, node_id: nodeId, node_type: nodeType }),

  choiceSelected: (adventureId: string, choiceLabel: string, choiceIndex: number) =>
    track('choice_selected', { adventure_id: adventureId, choice_label: choiceLabel, choice_index: choiceIndex }),

  storyComplete: (adventureId: string, adventureTitle: string) =>
    track('story_complete', { adventure_id: adventureId, adventure_title: adventureTitle }),

  storyRestart: (adventureId: string) =>
    track('story_restart', { adventure_id: adventureId }),

  sceneCopied: (adventureId: string) =>
    track('scene_copied', { adventure_id: adventureId }),

  // --- Creator ---
  adventureCreated: (adventureTitle: string) =>
    track('adventure_created', { adventure_title: adventureTitle }),

  adventureDeleted: (adventureId: string) =>
    track('adventure_deleted', { adventure_id: adventureId }),

  adventureSettingsSaved: (adventureId: string, audience: string) =>
    track('adventure_settings_saved', { adventure_id: adventureId, audience }),

  sceneAdded: (adventureId: string) =>
    track('scene_added', { adventure_id: adventureId }),

  sceneStatusChanged: (adventureId: string, nodeId: string, status: string) =>
    track('scene_status_changed', { adventure_id: adventureId, node_id: nodeId, status }),

  sceneTypeChanged: (adventureId: string, nodeId: string, nodeType: string) =>
    track('scene_type_changed', { adventure_id: adventureId, node_id: nodeId, node_type: nodeType }),

  choiceCreated: (adventureId: string) =>
    track('choice_created', { adventure_id: adventureId }),

  choiceDeleted: (adventureId: string) =>
    track('choice_deleted', { adventure_id: adventureId }),

  choiceLabelEdited: (adventureId: string) =>
    track('choice_label_edited', { adventure_id: adventureId }),

  imageGenerated: (adventureId: string, nodeId: string) =>
    track('image_generated', { adventure_id: adventureId, node_id: nodeId }),

  imageRegenerated: (adventureId: string, nodeId: string, attempt: number) =>
    track('image_regenerated', { adventure_id: adventureId, node_id: nodeId, attempt }),

  imageRemoved: (adventureId: string, nodeId: string) =>
    track('image_removed', { adventure_id: adventureId, node_id: nodeId }),

  // --- Sharing ---
  shareEnabled: (adventureId: string) =>
    track('share_enabled', { adventure_id: adventureId }),

  shareDisabled: (adventureId: string) =>
    track('share_disabled', { adventure_id: adventureId }),

  shareLinkCopied: (adventureId: string) =>
    track('share_link_copied', { adventure_id: adventureId }),

  // --- Explore / Landing ---
  exploreStoryClicked: (adventureId: string, adventureTitle: string) =>
    track('explore_story_clicked', { adventure_id: adventureId, adventure_title: adventureTitle }),

  landingSignInClicked: (location: string) =>
    track('landing_sign_in_clicked', { location }),
}
