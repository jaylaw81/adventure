// Types and labels only — no DB imports, safe to use in client components.

export type BillingStatus = 'active' | 'trial' | 'grace' | 'needs_billing' | 'issues' | 'org' | 'grandfathered'

export type SegmentCondition =
  | { field: 'billing_status';          value: BillingStatus }
  | { field: 'has_stories';             value: boolean }
  | { field: 'has_public_stories';      value: boolean }
  | { field: 'story_count_min';         value: number }
  | { field: 'account_status';          value: 'active' | 'suspended' }
  | { field: 'joined_last_days';        value: number }
  | { field: 'joined_more_than_days';   value: number }
  | { field: 'trial_ends_within_days';  value: number }
  | { field: 'inactive_days';           value: number }

export const FIELD_LABELS: Record<SegmentCondition['field'], string> = {
  billing_status:         'Billing status',
  has_stories:            'Has stories',
  has_public_stories:     'Has public stories',
  story_count_min:        'Story count ≥',
  account_status:         'Account status',
  joined_last_days:       'Joined in last N days',
  joined_more_than_days:  'Joined more than N days ago',
  trial_ends_within_days: 'Trial ends within N days',
  inactive_days:          'Inactive for N+ days',
}

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  active:        'Active subscriber',
  trial:         'In trial',
  grace:         'In grace period',
  needs_billing: 'Needs billing',
  issues:        'Billing issues',
  org:           'Organization user',
  grandfathered: 'Grandfathered',
}
