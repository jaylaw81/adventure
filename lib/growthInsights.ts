// Metrics for the admin insights "Growth & conversion" section.
import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jaylaw81@gmail.com'

// Template stories start with ~100 placeholder words, so word count (not scene count) signals real writing.
const WRITTEN_WORDS = 200

// Self-serve users only: org members and grandfathered accounts don't go through the paid funnel
const SELF_SERVE = sql`
  u.tier <> 'organization' and not u.grandfathered and u.email <> ${ADMIN_EMAIL}
  and not exists (select 1 from organization_members m where m.user_email = u.email)
`
const EVER_PAID = sql`u.subscription_status in ('active', 'trialing', 'past_due', 'paused', 'canceled')`
const STORY_STATS = sql`
  select a.id, a.user_email, a.created_from, a.story_type,
    (a.is_public and a.status = 'active') as published,
    exists (select 1 from choices c where c.adventure_id = a.id) as has_choices,
    (select count(*) from nodes n where n.adventure_id = a.id)::int as scenes,
    (select coalesce(sum(array_length(regexp_split_to_array(trim(n.content), '\s+'), 1)), 0)
       from nodes n where n.adventure_id = a.id and trim(n.content) <> '')::int as words
  from adventures a
`

async function rows<T>(query: SQL): Promise<T[]> {
  const result = await db.execute(query)
  return result.rows as T[]
}

export async function getGrowthInsights() {
  const [
    activation, depth, firstStory, sources, traffic, deleted, usage,
    upgrade, subTotals, cancelReasons, subscribeSpeed, emails, readers,
  ] = await Promise.all([
    // Activation funnel: each step requires the one before it, except paid
    rows<Record<string, number>>(sql`
      with s as (${STORY_STATS}),
      f as (
        select user_email, bool_or(has_choices) as choices, bool_or(words >= ${WRITTEN_WORDS}) as written, bool_or(published) as published
        from s group by user_email
      ),
      x as (
        select u.created_at > now() - interval '90 days' as recent, ${EVER_PAID} as paid,
          f.user_email is not null as story, coalesce(f.choices, false) as choices,
          coalesce(f.written, false) as written, coalesce(f.published, false) as published
        from users u left join f on f.user_email = u.email where ${SELF_SERVE}
      )
      select
        count(*)::int as signups, count(*) filter (where story)::int as story,
        count(*) filter (where story and choices)::int as choices,
        count(*) filter (where story and choices and written)::int as written,
        count(*) filter (where story and choices and written and published)::int as published,
        count(*) filter (where paid)::int as paid,
        count(*) filter (where recent)::int as signups90, count(*) filter (where recent and story)::int as story90,
        count(*) filter (where recent and story and choices)::int as choices90,
        count(*) filter (where recent and story and choices and written)::int as written90,
        count(*) filter (where recent and story and choices and written and published)::int as published90,
        count(*) filter (where recent and paid)::int as paid90
      from x
    `),

    // Story depth by how the story was started
    rows<{ start: string; stories: number; medianScenes: number; medianWords: number; written: number; withChoices: number; published: number }>(sql`
      with s as (${STORY_STATS})
      select coalesce(created_from, 'not recorded') as start, count(*)::int as stories,
        percentile_cont(0.5) within group (order by scenes)::float as "medianScenes",
        percentile_cont(0.5) within group (order by words)::float as "medianWords",
        count(*) filter (where words >= ${WRITTEN_WORDS})::int as written,
        count(*) filter (where has_choices)::int as "withChoices",
        count(*) filter (where published)::int as published
      from s group by 1 order by 2 desc
    `),

    // Signup → first story, by signup month
    rows<{ month: string; signups: number; withStory: number; medianMinutes: number | null }>(sql`
      select to_char(date_trunc('month', u.created_at), 'YYYY-MM') as month, count(*)::int as signups,
        count(f.first_story)::int as "withStory",
        (percentile_cont(0.5) within group (order by extract(epoch from f.first_story - u.created_at) / 60))::float as "medianMinutes"
      from users u
      left join (select user_email, min(created_at) as first_story from adventures group by 1) f on f.user_email = u.email
      where ${SELF_SERVE} and u.created_at > date_trunc('month', now()) - interval '5 months'
      group by 1 order by 1
    `),

    // Signup → paid by self-reported source
    rows<{ source: string; signups: number; withStory: number; paid: number }>(sql`
      select coalesce(u.acquisition_source, 'not recorded') as source, count(*)::int as signups,
        count(*) filter (where exists (select 1 from adventures a where a.user_email = u.email))::int as "withStory",
        count(*) filter (where ${EVER_PAID})::int as paid
      from users u where ${SELF_SERVE} group by 1 order by 2 desc
    `),

    // Reader traffic by category, last 30 days vs the 30 before
    rows<{ category: string; last30: number; prior30: number }>(sql`
      select referrer_category as category,
        count(*) filter (where created_at > now() - interval '30 days')::int as last30,
        count(*) filter (where created_at <= now() - interval '30 days')::int as prior30
      from story_referrers where created_at > now() - interval '60 days'
      group by 1 order by 2 desc
    `),

    rows<Record<string, number | null>>(sql`
      select count(*)::int as total,
        count(*) filter (where deleted_at > now() - interval '30 days')::int as last30,
        count(*) filter (where had_paid_subscription)::int as paid,
        count(*) filter (where reason = 'admin_deleted')::int as "byAdmin",
        count(signed_up_at)::int as "withTenure",
        (percentile_cont(0.5) within group (order by extract(epoch from deleted_at - signed_up_at) / 86400))::float as "medianDays"
      from deleted_accounts
    `),

    // Features with little or no use
    rows<Record<string, number>>(sql`
      select
        (select count(*) from friend_invites)::int as invites,
        (select count(*) from friend_invites where status = 'rewarded')::int as "invitesRewarded",
        (select count(*) from story_reviews)::int as reviews,
        (select count(*) from story_reviews where coalesce(trim(review_text), '') <> '')::int as "reviewsWithText",
        (select count(*) from survey_responses)::int as "surveyResponses",
        (select count(*) from site_feedback)::int as feedback
    `),

    // Upgrade funnel: distinct users at each step
    rows<{ event: string; last30: number; total: number }>(sql`
      select event,
        count(distinct user_email) filter (where created_at > now() - interval '30 days')::int as last30,
        count(distinct user_email)::int as total
      from funnel_events group by 1
    `),

    rows<{ type: string; last30: number; total: number }>(sql`
      select type, count(*) filter (where created_at > now() - interval '30 days')::int as last30, count(*)::int as total
      from subscription_events group by 1
    `),

    rows<{ reason: string; count: number }>(sql`
      select coalesce(detail, 'not given') as reason, count(*)::int as count
      from subscription_events where type in ('canceled', 'cancel_scheduled')
      group by 1 order by 2 desc
    `),

    rows<{ medianDays: number | null; n: number; activeNow: number }>(sql`
      select (percentile_cont(0.5) within group (order by extract(epoch from e.created_at - u.created_at) / 86400))::float as "medianDays",
        count(e.id)::int as n,
        (select count(*) from users where subscription_status in ('active', 'trialing'))::int as "activeNow"
      from subscription_events e join users u on u.email = e.user_email where e.type = 'subscribed'
    `),

    // Lifecycle emails, with subscriptions within 7 days of sending
    rows<{ emailType: string; sent: number; delivered: number; opened: number; clicked: number; bounced: number; subscribed: number }>(sql`
      select e.email_type as "emailType",
        count(*) filter (where e.event = 'sent')::int as sent,
        count(*) filter (where e.event = 'delivered')::int as delivered,
        count(*) filter (where e.event = 'opened')::int as opened,
        count(*) filter (where e.event = 'clicked')::int as clicked,
        count(*) filter (where e.event in ('bounced', 'complained'))::int as bounced,
        count(*) filter (where e.event = 'sent' and exists (
          select 1 from subscription_events se
          where se.user_email = e.recipient and se.type = 'subscribed'
            and se.created_at between e.created_at and e.created_at + interval '7 days'
        ))::int as subscribed
      from email_events e group by 1 order by 2 desc
    `),

    // Reader journey, busiest stories first
    rows<{ id: string; title: string; storyType: string | null; starts: number; completions: number; topExit: string | null; topExitCount: number | null }>(sql`
      select a.id, a.title, a.story_type as "storyType",
        coalesce(max(st.views) filter (where n.node_type = 'start'), 0)::int as starts,
        coalesce(sum(st.views) filter (where n.node_type = 'ending'), 0)::int as completions,
        ex.title as "topExit", ex.exits as "topExitCount"
      from story_scene_stats st
      join nodes n on n.id = st.node_id
      join adventures a on a.id = st.adventure_id
      left join lateral (
        select n2.title, (s2.views - s2.continues)::int as exits
        from story_scene_stats s2 join nodes n2 on n2.id = s2.node_id
        where s2.adventure_id = a.id and n2.node_type <> 'ending' and s2.views > s2.continues
        order by s2.views - s2.continues desc limit 1
      ) ex on true
      group by a.id, a.title, a.story_type, ex.title, ex.exits
      order by starts desc limit 10
    `),
  ])

  return {
    writtenWords: WRITTEN_WORDS,
    activation: activation[0],
    depth,
    firstStory,
    sources,
    traffic,
    deleted: deleted[0],
    usage: usage[0],
    upgrade,
    subscriptions: { totals: subTotals, cancelReasons, speed: subscribeSpeed[0] },
    emails,
    readers,
  }
}
