import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq, exists, gt, lt, ne, notExists, or, isNull, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures, nodes, choices } from '@/lib/schema'
import { getGAClient, gaProperty, EVENT_LABELS } from '@/lib/ga-data'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {

  const now = new Date()
  const days7 = new Date(now.getTime() - 7 * 86_400_000)
  const days14 = new Date(now.getTime() - 14 * 86_400_000)
  const days7ahead = new Date(now.getTime() + 7 * 86_400_000)

  // ── DB queries (all parallel) ─────────────────────────────────────────────

  const [
    [unpublishedRow],
    trialsExpiring,
    [newUsersNoStoryRow],
    [needsBillingWithStoriesRow],
    [abandonedRow],
    [noChoicesRow],
    [storyCounts],
    recentPublic,
    [paidUsersRow],
  ] = await Promise.all([

    // Users who have created stories but zero are public
    db.select({ count: sql<number>`count(distinct ${users.email})::int` })
      .from(users)
      .where(and(
        exists(db.select({ x: adventures.userEmail }).from(adventures).where(eq(adventures.userEmail, users.email))),
        notExists(db.select({ x: adventures.userEmail }).from(adventures).where(
          and(eq(adventures.userEmail, users.email), eq(adventures.isPublic, true), eq(adventures.status, 'active'))
        )),
      )),

    // Trial users expiring within 7 days who have at least one story
    db.select({
      email: users.email,
      displayName: users.displayName,
      trialEndsAt: users.trialEndsAt,
    })
      .from(users)
      .where(and(
        gt(users.trialEndsAt, now),
        lt(users.trialEndsAt, days7ahead),
        or(isNull(users.subscriptionStatus), ne(users.subscriptionStatus, 'active')),
        exists(db.select({ x: adventures.userEmail }).from(adventures).where(eq(adventures.userEmail, users.email))),
      ))
      .orderBy(users.trialEndsAt),

    // New users (last 14 days) who haven't created any story
    db.select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(
        gt(users.createdAt, days14),
        notExists(db.select({ x: adventures.userEmail }).from(adventures).where(eq(adventures.userEmail, users.email))),
      )),

    // "Needs billing" users who DO have stories (unconverted engaged users)
    db.select({ count: sql<number>`count(distinct ${users.email})::int` })
      .from(users)
      .where(and(
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
        exists(db.select({ x: adventures.userEmail }).from(adventures).where(eq(adventures.userEmail, users.email))),
      )),

    // Abandoned stories: has nodes, no ending node, not updated in 7+ days
    db.select({ count: sql<number>`count(*)::int` })
      .from(adventures)
      .where(and(
        eq(adventures.status, 'active'),
        lt(adventures.updatedAt, days7),
        exists(db.select({ x: nodes.adventureId }).from(nodes).where(eq(nodes.adventureId, adventures.id))),
        notExists(db.select({ x: nodes.adventureId }).from(nodes).where(
          and(eq(nodes.adventureId, adventures.id), eq(nodes.nodeType, 'ending'))
        )),
      )),

    // Stories with no choices at all (no branching)
    db.select({ count: sql<number>`count(*)::int` })
      .from(adventures)
      .where(and(
        eq(adventures.status, 'active'),
        exists(db.select({ x: nodes.adventureId }).from(nodes).where(eq(nodes.adventureId, adventures.id))),
        notExists(db.select({ x: choices.adventureId }).from(choices).where(eq(choices.adventureId, adventures.id))),
      )),

    // Public vs private story counts
    db.select({
      publicCount:  sql<number>`count(*) filter (where ${adventures.isPublic} = true  and ${adventures.status} = 'active')::int`,
      privateCount: sql<number>`count(*) filter (where ${adventures.isPublic} = false and ${adventures.status} = 'active')::int`,
    }).from(adventures),

    // Last 6 public stories for social content suggestions
    db.select({
      id: adventures.id,
      title: adventures.title,
      userEmail: adventures.userEmail,
      shareToken: adventures.shareToken,
      updatedAt: adventures.updatedAt,
    })
      .from(adventures)
      .where(and(eq(adventures.isPublic, true), eq(adventures.status, 'active')))
      .orderBy(sql`${adventures.updatedAt} desc`)
      .limit(6),

    // Paid/grandfathered user count (to compute avg stories per subscriber in JS)
    db.select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(or(
        eq(users.subscriptionStatus, 'active'),
        eq(users.subscriptionStatus, 'trialing'),
        eq(users.grandfathered, true),
      )),
  ])

  // ── Google Analytics ──────────────────────────────────────────────────────

  const gaClient = getGAClient()
  const gaConfigured = !!gaClient

  let gaData: {
    activeUsers7d?: number
    activeUsers28d?: number
    newUsers14d?: number
    topEvents?: { name: string; label: string; count: number }[]
    topSources?: { source: string; sessions: number }[]
  } = {}

  if (gaClient) {
    try {
      const property = gaProperty()

      const [[overviewRes], [weekRes], [eventsRes], [sourcesRes]] = await Promise.all([
        gaClient.runReport({
          property,
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }],
        }),
        gaClient.runReport({
          property,
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }],
        }),
        gaClient.runReport({
          property,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          limit: 12,
        }),
        gaClient.runReport({
          property,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionSource' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 8,
        }),
      ])

      gaData.activeUsers28d = parseInt(overviewRes?.rows?.[0]?.metricValues?.[0]?.value ?? '0')
      gaData.newUsers14d    = parseInt(overviewRes?.rows?.[0]?.metricValues?.[1]?.value ?? '0')
      gaData.activeUsers7d  = parseInt(weekRes?.rows?.[0]?.metricValues?.[0]?.value ?? '0')

      gaData.topEvents = (eventsRes?.rows ?? [])
        .map(row => {
          const name = row.dimensionValues?.[0]?.value ?? ''
          const count = parseInt(row.metricValues?.[0]?.value ?? '0')
          return { name, label: EVENT_LABELS[name] ?? name, count }
        })
        .filter(e => e.count > 0)

      gaData.topSources = (sourcesRes?.rows ?? [])
        .map(row => ({
          source: row.dimensionValues?.[0]?.value ?? '(direct)',
          sessions: parseInt(row.metricValues?.[0]?.value ?? '0'),
        }))
        .filter(s => s.sessions > 0)

    } catch (err) {
      console.error('GA Data API error:', err)
      // Return DB data only; don't crash
    }
  }

  return NextResponse.json({
    db: {
      unpublishedCreators: unpublishedRow?.count ?? 0,
      trialsExpiringSoon: trialsExpiring.map(u => ({
        email: u.email,
        displayName: u.displayName,
        trialEndsAt: u.trialEndsAt?.toISOString() ?? null,
      })),
      newUsersNoStory: newUsersNoStoryRow?.count ?? 0,
      needsBillingWithStories: needsBillingWithStoriesRow?.count ?? 0,
      abandonedStories: abandonedRow?.count ?? 0,
      storiesWithNoChoices: noChoicesRow?.count ?? 0,
      publicStoryCount: storyCounts?.publicCount ?? 0,
      privateStoryCount: storyCounts?.privateCount ?? 0,
      recentPublicStories: recentPublic,
      avgStoriesPerActiveUser: (() => {
        const total = (storyCounts?.publicCount ?? 0) + (storyCounts?.privateCount ?? 0)
        const paid = paidUsersRow?.count ?? 0
        return paid > 0 ? Math.round((total / paid) * 10) / 10 : 0
      })(),
    },
    ga: {
      configured: gaConfigured,
      ...gaData,
    },
  })

  } catch (err) {
    console.error('[insights] route error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
