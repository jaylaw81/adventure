// Server-only — imports db. Do not import this in client components.
// For client-safe types/labels use lib/segmentTypes.ts instead.
import { and, eq, exists, gt, isNotNull, isNull, lt, ne, notExists, or, sql } from 'drizzle-orm'
import { db } from './db'
import { users, adventures } from './schema'
import type { SegmentCondition, BillingStatus } from './segmentTypes'

export type { SegmentCondition, BillingStatus }
export { FIELD_LABELS, BILLING_STATUS_LABELS } from './segmentTypes'

// ── Correlated sub-selects ────────────────────────────────────────────────────

const subAny = () =>
  db.select({ x: adventures.userEmail }).from(adventures)
    .where(and(eq(adventures.userEmail, users.email), eq(adventures.status, 'active')))

const subPublic = () =>
  db.select({ x: adventures.userEmail }).from(adventures)
    .where(and(eq(adventures.userEmail, users.email), eq(adventures.isPublic, true), eq(adventures.status, 'active')))

const subUpdatedAfter = (cutoff: Date) =>
  db.select({ x: adventures.userEmail }).from(adventures)
    .where(and(eq(adventures.userEmail, users.email), gt(adventures.updatedAt, cutoff)))

// ── Billing clause ────────────────────────────────────────────────────────────

function billingClause(value: BillingStatus, now: Date) {
  switch (value) {
    case 'active':
      return eq(users.subscriptionStatus, 'active')
    case 'trial':
      return or(
        eq(users.subscriptionStatus, 'trialing'),
        and(isNotNull(users.trialEndsAt), gt(users.trialEndsAt, now)),
      )
    case 'grace':
      return and(isNotNull(users.gracePeriodEndsAt), gt(users.gracePeriodEndsAt, now))
    case 'needs_billing':
      return and(
        eq(users.grandfathered, false),
        ne(users.tier, 'organization'),
        or(isNull(users.subscriptionStatus), and(
          ne(users.subscriptionStatus, 'active'),
          ne(users.subscriptionStatus, 'trialing'),
          ne(users.subscriptionStatus, 'past_due'),
          ne(users.subscriptionStatus, 'canceled'),
          ne(users.subscriptionStatus, 'paused'),
        )),
        or(isNull(users.trialEndsAt), lt(users.trialEndsAt, now)),
        or(isNull(users.gracePeriodEndsAt), lt(users.gracePeriodEndsAt, now)),
      )
    case 'issues':
      return or(
        eq(users.subscriptionStatus, 'past_due'),
        eq(users.subscriptionStatus, 'canceled'),
        eq(users.subscriptionStatus, 'paused'),
      )
    case 'org':
      return eq(users.tier, 'organization')
    case 'grandfathered':
      return eq(users.grandfathered, true)
  }
}

// ── Main builder ──────────────────────────────────────────────────────────────

function conditionClause(c: SegmentCondition, now: Date) {
  switch (c.field) {
    case 'billing_status':
      return billingClause(c.value, now)
    case 'has_stories':
      return c.value ? exists(subAny()) : notExists(subAny())
    case 'has_public_stories':
      return c.value ? exists(subPublic()) : notExists(subPublic())
    case 'story_count_min':
      return sql`(select count(*) from ${adventures} where ${adventures.userEmail} = ${users.email} and ${adventures.status} = 'active') >= ${c.value}`
    case 'account_status':
      return eq(users.status, c.value)
    case 'joined_last_days': {
      const cutoff = new Date(now.getTime() - c.value * 86_400_000)
      return gt(users.createdAt, cutoff)
    }
    case 'joined_more_than_days': {
      const cutoff = new Date(now.getTime() - c.value * 86_400_000)
      return lt(users.createdAt, cutoff)
    }
    case 'trial_ends_within_days': {
      const cutoff = new Date(now.getTime() + c.value * 86_400_000)
      return and(isNotNull(users.trialEndsAt), gt(users.trialEndsAt, now), lt(users.trialEndsAt, cutoff))
    }
    case 'inactive_days': {
      const cutoff = new Date(now.getTime() - c.value * 86_400_000)
      return notExists(subUpdatedAfter(cutoff))
    }
  }
}

export function buildSegmentWhere(conditions: SegmentCondition[]) {
  if (conditions.length === 0) return undefined
  const now = new Date()
  const clauses = conditions.map(c => conditionClause(c, now)).filter(Boolean)
  if (clauses.length === 0) return undefined
  if (clauses.length === 1) return clauses[0]!
  return and(...(clauses as [NonNullable<ReturnType<typeof conditionClause>>, ...NonNullable<ReturnType<typeof conditionClause>>[]]))
}
