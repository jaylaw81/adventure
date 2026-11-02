'use client'

import { useEffect, useState } from 'react'
import { ACQUISITION_SOURCE_LABELS } from '@/lib/acquisitionSources'

interface GrowthData {
  writtenWords: number
  activation: Record<string, number>
  depth: { start: string; stories: number; medianScenes: number; medianWords: number; written: number; withChoices: number; published: number }[]
  firstStory: { month: string; signups: number; withStory: number; medianMinutes: number | null }[]
  sources: { source: string; signups: number; withStory: number; paid: number }[]
  traffic: { category: string; last30: number; prior30: number }[]
  deleted: { total: number; last30: number; paid: number; byAdmin: number; withTenure: number; medianDays: number | null }
  usage: { invites: number; invitesRewarded: number; reviews: number; reviewsWithText: number; surveyResponses: number; feedback: number }
  upgrade: { event: string; last30: number; total: number }[]
  subscriptions: {
    totals: { type: string; last30: number; total: number }[]
    cancelReasons: { reason: string; count: number }[]
    speed: { medianDays: number | null; n: number; activeNow: number }
  }
  emails: { emailType: string; sent: number; delivered: number; opened: number; clicked: number; bounced: number; subscribed: number }[]
  readers: { id: string; title: string; storyType: string | null; starts: number; completions: number; topExit: string | null; topExitCount: number | null }[]
}

const UPGRADE_STEPS = [
  { event: 'free_limit_hit', label: 'Hit the free story limit' },
  { event: 'pricing_viewed', label: 'Viewed pricing (other visits)' },
  { event: 'subscribe_viewed', label: 'Viewed subscribe page' },
  { event: 'checkout_started', label: 'Started checkout' },
  { event: 'checkout_completed', label: 'Completed checkout' },
  { event: 'checkout_expired', label: 'Abandoned checkout' },
]
const SUB_EVENTS: Record<string, string> = {
  subscribed: 'New subscriptions',
  plan_changed: 'Plan changes',
  cancel_scheduled: 'Cancellations scheduled',
  cancel_reverted: 'Cancellations undone',
  canceled: 'Subscriptions ended',
  payment_failed: 'Failed payments',
}
const EMAIL_LABELS: Record<string, string> = {
  upgrade_nudge: 'Upgrade email',
  checkout_reminder: 'Abandoned checkout',
  payment_failed: 'Failed payment',
  cancellation: 'Cancellation',
}
const CANCEL_REASONS: Record<string, string> = {
  too_expensive: 'Too expensive',
  switched_service: 'Switched service',
  unused: 'Not using it',
  missing_features: 'Missing features',
  low_quality: 'Quality issues',
  too_complex: 'Too complex',
  customer_service: 'Customer service',
  other: 'Other',
  'not given': 'No reason given',
}

const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '–')

function formatMinutes(m: number | null): string {
  if (m === null) return '–'
  if (m < 60) return `${Math.round(m)} min`
  if (m < 2880) return `${Math.round(m / 60)} hr`
  return `${Math.round(m / 1440)} days`
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400 text-right">
            {head.map((h, i) => <th key={h} className={`font-medium pb-2 pl-3 ${i === 0 ? 'text-left pl-0' : ''}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, i) => (
                <td key={i} className={`py-1.5 pl-3 tabular-nums ${i === 0 ? 'text-left pl-0 text-slate-700 font-medium' : 'text-right text-slate-500'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GrowthInsights() {
  const [data, setData] = useState<GrowthData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/insights/growth')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setError(true))
  }, [])

  const heading = <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Growth &amp; conversion</h2>
  if (error) return <section>{heading}<p className="text-sm text-red-600">Couldn&apos;t load growth data.</p></section>
  if (!data) return <section>{heading}<p className="text-sm text-slate-400">Loading…</p></section>

  const a = data.activation
  const funnel = [
    { label: 'Signed up', all: a.signups, recent: a.signups90 },
    { label: 'Created a story', all: a.story, recent: a.story90 },
    { label: 'Story has choices', all: a.choices, recent: a.choices90 },
    { label: `Wrote ${data.writtenWords}+ words`, all: a.written, recent: a.written90 },
    { label: 'Published', all: a.published, recent: a.published90 },
    { label: 'Ever paid (any step)', all: a.paid, recent: a.paid90 },
  ]
  const { totals, cancelReasons, speed } = data.subscriptions
  const countOf = (type: string) => totals.find(t => t.type === type)
  const ended30 = countOf('canceled')?.last30 ?? 0
  const upgradeRows = UPGRADE_STEPS
    .map(s => ({ ...s, row: data.upgrade.find(u => u.event === s.event) }))
    .filter(s => s.row)

  return (
    <section>
      {heading}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Activation funnel" note="Self-serve users. Each step includes the one before it, except paid.">
          <div className="space-y-2.5">
            {funnel.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{s.label}</span>
                  <span className="text-slate-400 tabular-nums">
                    {s.all} · {pct(s.all, a.signups)} <span className="text-slate-300">|</span> last 90d: {s.recent} · {pct(s.recent, a.signups90)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: pct(s.all, a.signups) }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Upgrade funnel" note="Distinct signed-in users, from when tracking began.">
          {upgradeRows.length === 0
            ? <Empty>No data yet. This fills in as people reach the pricing and checkout pages.</Empty>
            : <Table head={['Step', 'Last 30 days', 'All time']} rows={upgradeRows.map(s => [s.label, s.row!.last30, s.row!.total])} />}
        </Card>

        <Card title="Subscription history" note="Starts from when tracking began, so earlier subscribers aren't included.">
          {totals.length === 0
            ? <Empty>No subscription changes recorded yet. {speed.activeNow} active right now.</Empty>
            : (
              <>
                <Table
                  head={['Event', 'Last 30 days', 'All time']}
                  rows={Object.entries(SUB_EVENTS).flatMap(([type, label]) => {
                    const row = countOf(type)
                    return row ? [[label, row.last30, row.total]] : []
                  })}
                />
                <p className="text-xs text-slate-500 mt-3">
                  Monthly churn: {pct(ended30, speed.activeNow + ended30)} · Median sign-up to subscribe:{' '}
                  {speed.medianDays === null ? '–' : `${Math.round(speed.medianDays)} days`} ({speed.n} tracked)
                </p>
              </>
            )}
        </Card>

        <Card title="Why people cancel" note="From Stripe's cancellation form, when the customer answers it.">
          {cancelReasons.length === 0
            ? <Empty>No cancellations recorded yet.</Empty>
            : <Table head={['Reason', 'Count']} rows={cancelReasons.map(r => [CANCEL_REASONS[r.reason] ?? r.reason, r.count])} />}
        </Card>

        <Card title="Email results" note="Opens and clicks need tracking enabled in Resend. Subscribed = within 7 days of sending.">
          {data.emails.length === 0
            ? <Empty>No tracked emails sent yet.</Empty>
            : (
              <Table
                head={['Email', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Subscribed']}
                rows={data.emails.map(e => [EMAIL_LABELS[e.emailType] ?? e.emailType, e.sent, e.delivered, e.opened, e.clicked, e.bounced, e.subscribed])}
              />
            )}
        </Card>

        <Card title="Sign-up to paid by source" note="Self-reported at sign-up. Many users have no source recorded.">
          <Table
            head={['Source', 'Signups', 'Wrote a story', 'Paid', 'Paid %']}
            rows={data.sources.map(s => [ACQUISITION_SOURCE_LABELS[s.source] ?? s.source, s.signups, s.withStory, s.paid, pct(s.paid, s.signups)])}
          />
        </Card>

        <Card title="Story depth by starting point" note={`"Written" = ${data.writtenWords}+ words. Templates begin with placeholder text.`}>
          <Table
            head={['Start', 'Stories', 'Med. scenes', 'Med. words', 'Written', 'Published']}
            rows={data.depth.map(d => [d.start, d.stories, Math.round(d.medianScenes), Math.round(d.medianWords), pct(d.written, d.stories), pct(d.published, d.stories)])}
          />
        </Card>

        <Card title="Time to first story" note="By sign-up month. Very short times suggest quick starts rather than finished stories.">
          <Table
            head={['Month', 'Signups', 'Made a story', 'Median time']}
            rows={data.firstStory.map(m => [m.month, m.signups, pct(m.withStory, m.signups), formatMinutes(m.medianMinutes)])}
          />
        </Card>

        <Card title="Reader traffic by source" note="Reads by referrer category.">
          {data.traffic.length === 0
            ? <Empty>No reads recorded in the last 60 days.</Empty>
            : <Table head={['Category', 'Last 30 days', 'Prior 30 days']} rows={data.traffic.map(t => [t.category, t.last30, t.prior30])} />}
        </Card>

        <Card title="Deleted accounts" note="Time to deletion is only known for accounts deleted from now on.">
          <Table
            head={['Metric', 'Count']}
            rows={[
              ['Total deleted', data.deleted.total],
              ['Last 30 days', data.deleted.last30],
              ['Had paid', data.deleted.paid],
              ['Removed by admin', data.deleted.byAdmin],
              ['Median days before deleting', data.deleted.medianDays === null ? '–' : Math.round(data.deleted.medianDays)],
            ]}
          />
        </Card>

        <Card title="Feature use">
          <Table
            head={['Feature', 'Count']}
            rows={[
              ['Friend invites sent', data.usage.invites],
              ['Invites rewarded', data.usage.invitesRewarded],
              ['Story reviews', data.usage.reviews],
              ['Reviews with text', data.usage.reviewsWithText],
              ['Survey responses', data.usage.surveyResponses],
              ['Site feedback', data.usage.feedback],
            ]}
          />
        </Card>

        <Card title="Reader drop-off by story" note="Approximate: going back or replaying counts as another view.">
          {data.readers.length === 0
            ? <Empty>No reader journeys recorded yet.</Empty>
            : (
              <Table
                head={['Story', 'Starts', 'Completed', 'Most exits']}
                rows={data.readers.map(r => [
                  r.title,
                  r.starts,
                  r.storyType === 'storybook' ? 'n/a' : pct(Math.min(r.completions, r.starts), r.starts),
                  r.topExit ? `${r.topExit} (${r.topExitCount})` : '–',
                ])}
              />
            )}
        </Card>
      </div>
    </section>
  )
}
