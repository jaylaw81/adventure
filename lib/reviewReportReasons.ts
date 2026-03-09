export interface ReviewReportReason {
  value: string
  label: string
  description: string
}

export const REVIEW_REPORT_REASONS: ReviewReportReason[] = [
  {
    value: 'inappropriate',
    label: 'Inappropriate or offensive content',
    description: 'Contains offensive, hateful, or inappropriate language.',
  },
  {
    value: 'spam',
    label: 'Spam or fake review',
    description: 'Appears to be spam, a bot, or a fake/incentivised review.',
  },
  {
    value: 'harassment',
    label: 'Harassment or personal attack',
    description: 'Targets or harasses the story author or other users.',
  },
  {
    value: 'spoilers',
    label: 'Spoilers without warning',
    description: 'Reveals major story plot details without a spoiler warning.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another concern not listed above. Please describe it.',
  },
]

export const VALID_REVIEW_REPORT_REASONS = new Set(REVIEW_REPORT_REASONS.map(r => r.value))
