export const ACQUISITION_SOURCES: { value: string; label: string }[] = [
  { value: 'google',    label: 'Google search' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'friend',    label: 'Friend or word of mouth' },
  { value: 'reddit',    label: 'Reddit' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'other',     label: 'Other / not sure' },
]

export const ACQUISITION_SOURCE_LABELS: Record<string, string> =
  Object.fromEntries(ACQUISITION_SOURCES.map(s => [s.value, s.label]))
