import { BetaAnalyticsDataClient } from '@google-analytics/data'

export function getGAClient(): BetaAnalyticsDataClient | null {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const propertyId = process.env.GA_PROPERTY_ID
  if (!keyJson || !propertyId) return null
  try {
    const credentials = JSON.parse(keyJson)
    return new BetaAnalyticsDataClient({ credentials })
  } catch {
    return null
  }
}

export function gaProperty(): string {
  return `properties/${process.env.GA_PROPERTY_ID ?? ''}`
}

// Human-readable labels for our custom GA event names
export const EVENT_LABELS: Record<string, string> = {
  adventure_created:          'Stories created',
  scene_added:                'Scenes added',
  choice_created:             'Choices added',
  image_generated:            'AI images generated',
  image_regenerated:          'AI images regenerated',
  share_enabled:              'Stories shared',
  share_link_copied:          'Share links copied',
  story_start:                'Story reads started',
  story_complete:             'Stories completed',
  explore_story_clicked:      'Explore clicks',
  scene_sound_play:           'Sound plays',
  user_registered:            'Registrations',
  adventure_settings_saved:   'Settings saved',
}
