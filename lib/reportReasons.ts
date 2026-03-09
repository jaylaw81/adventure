export interface ReportReason {
  value: string
  label: string
  description: string
  severe?: boolean
}

export const REPORT_REASONS: ReportReason[] = [
  {
    value: 'rating_mismatch',
    label: "Rating doesn't match content",
    description: "The story's age rating (All Ages, Teens, Adults) doesn't reflect its actual content.",
  },
  {
    value: 'child_abuse',
    label: 'Child abuse content',
    description: 'Content depicting, glorifying, or promoting the abuse of minors.',
    severe: true,
  },
  {
    value: 'csam',
    label: 'Child sexual abuse material (CSAM)',
    description: 'Any sexual content involving minors, including written depictions.',
    severe: true,
  },
  {
    value: 'hate_speech',
    label: 'Hate speech or discrimination',
    description: 'Content promoting hatred based on race, religion, gender, sexuality, or other characteristics.',
  },
  {
    value: 'graphic_violence',
    label: 'Graphic violence',
    description: 'Excessively graphic or disturbing violent content.',
  },
  {
    value: 'spam',
    label: 'Spam or misleading content',
    description: 'Spam, scams, or deliberately misleading content.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another concern not listed above. Please describe it in the details field.',
  },
]

export const VALID_REASONS = new Set(REPORT_REASONS.map(r => r.value))
