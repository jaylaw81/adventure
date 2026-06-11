'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Lightbulb, Users, Clock, TrendingUp, BookOpen,
  Share2, AlertTriangle, CheckCircle2, ExternalLink,
  BarChart3, Globe, Zap, Copy, Check, Settings,
  UserPlus, CreditCard, GitBranch,
} from 'lucide-react'

interface TrialUser {
  email: string
  displayName: string
  trialEndsAt: string | null
}

interface RecentStory {
  id: string
  title: string
  userEmail: string | null
  shareToken: string | null
  updatedAt: string
}

interface InsightsData {
  db: {
    unpublishedCreators: number
    trialsExpiringSoon: TrialUser[]
    newUsersNoStory: number
    needsBillingWithStories: number
    abandonedStories: number
    storiesWithNoChoices: number
    publicStoryCount: number
    privateStoryCount: number
    recentPublicStories: RecentStory[]
    avgStoriesPerActiveUser: number
  }
  ga: {
    configured: boolean
    activeUsers7d?: number
    activeUsers28d?: number
    newUsers14d?: number
    topEvents?: { name: string; label: string; count: number }[]
    topSources?: { source: string; sessions: number }[]
  }
}

function daysLeft(dateStr: string | null): number {
  if (!dateStr) return 0
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000))
}

// ── Action card ───────────────────────────────────────────────────────────────

type Urgency = 'high' | 'medium' | 'low'

function ActionCard({
  urgency, icon, title, count, unit, description, cta, ctaHref,
}: {
  urgency: Urgency
  icon: React.ReactNode
  title: string
  count: number
  unit: string
  description: string
  cta: string
  ctaHref: string
}) {
  const colors: Record<Urgency, { border: string; badge: string; dot: string }> = {
    high:   { border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
    medium: { border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    low:    { border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',  dot: 'bg-blue-500' },
  }
  const c = colors[urgency]
  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.badge}`}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${c.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {urgency === 'high' ? 'High' : urgency === 'medium' ? 'Attention' : 'Opportunity'}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{count.toLocaleString()} <span className="text-base font-normal text-slate-400">{unit}</span></p>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <Link
        href={ctaHref}
        className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors w-fit"
      >
        {cta} <ExternalLink size={11} />
      </Link>
    </div>
  )
}

// ── Bar chart row ─────────────────────────────────────────────────────────────

function BarRow({ label, value, max, color = 'bg-violet-500' }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-40 shrink-0 truncate" title={label}>{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-12 text-right shrink-0">{value.toLocaleString()}</span>
    </div>
  )
}

// ── Social copy button ────────────────────────────────────────────────────────

function CopyPostButton({ story }: { story: RecentStory }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const url = story.shareToken
      ? `https://www.storyquestor.com/s/${story.shareToken}`
      : `https://www.storyquestor.com`
    const post = `📖 "${story.title}" — a choose-your-own-adventure story on StoryQuestor!\n\nPlay it free: ${url}`
    navigator.clipboard.writeText(post)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
      title="Copy social media post"
    >
      {copied ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy post'}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/insights')
      .then(r => {
        if (!r.ok) return r.json().then(e => { throw new Error(e.error ?? `HTTP ${r.status}`) })
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(err => { console.error('Insights load error:', err); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading insights…</div>
  if (!data) return <div className="p-8 text-center text-slate-400 text-sm">Failed to load.</div>

  const { db, ga } = data
  const maxEvent = Math.max(...(ga.topEvents?.map(e => e.count) ?? [1]), 1)
  const maxSource = Math.max(...(ga.topSources?.map(s => s.sessions) ?? [1]), 1)
  const totalStories = db.publicStoryCount + db.privateStoryCount

  return (
    <div className="p-4 md:p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb size={22} className="text-amber-500" />
          Insights
        </h1>
        <p className="text-slate-500 text-sm mt-1">Recommended actions based on user behavior and platform data</p>
      </div>

      {/* ── Action Items ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Action items</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {db.trialsExpiringSoon.length > 0 && (
            <ActionCard
              urgency="high"
              icon={<Clock size={15} />}
              title="Trials expiring this week"
              count={db.trialsExpiringSoon.length}
              unit="users"
              description="These users have active stories and their trial ends within 7 days — prime conversion window."
              cta="Send conversion email"
              ctaHref="/admin/messages"
            />
          )}

          {db.unpublishedCreators > 0 && (
            <ActionCard
              urgency="medium"
              icon={<BookOpen size={15} />}
              title="Stories never published"
              count={db.unpublishedCreators}
              unit="creators"
              description="Users who have created stories but none are public. Encourage them to share their work."
              cta="Send publishing prompt"
              ctaHref="/admin/messages"
            />
          )}

          {db.newUsersNoStory > 0 && (
            <ActionCard
              urgency="medium"
              icon={<UserPlus size={15} />}
              title="New signups, no stories"
              count={db.newUsersNoStory}
              unit="users"
              description="Joined in the last 14 days but haven't created a story yet. An onboarding nudge could activate them."
              cta="Send onboarding email"
              ctaHref="/admin/messages"
            />
          )}

          {db.needsBillingWithStories > 0 && (
            <ActionCard
              urgency="medium"
              icon={<CreditCard size={15} />}
              title="Engaged but unsubscribed"
              count={db.needsBillingWithStories}
              unit="users"
              description="Users with stories who have never set up billing. They're invested — a nudge may convert them."
              cta="Email this audience"
              ctaHref="/admin/messages"
            />
          )}

          {db.abandonedStories > 0 && (
            <ActionCard
              urgency="low"
              icon={<AlertTriangle size={15} />}
              title="Abandoned stories"
              count={db.abandonedStories}
              unit="stories"
              description="Stories with scenes but no ending, untouched for 7+ days. May indicate editor friction."
              cta="View users"
              ctaHref="/admin/users"
            />
          )}

          {db.storiesWithNoChoices > 0 && (
            <ActionCard
              urgency="low"
              icon={<GitBranch size={15} />}
              title="Linear stories (no choices)"
              count={db.storiesWithNoChoices}
              unit="stories"
              description="Stories with scenes but no branching choices. Could be intentional or creators stuck on the choice mechanic."
              cta="View stories"
              ctaHref="/admin"
            />
          )}
        </div>

        {db.trialsExpiringSoon.length > 0 && (
          <div className="mt-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Clock size={13} className="text-red-500" />
              <span className="text-xs font-semibold text-slate-600">Trial users expiring soon</span>
            </div>
            <div className="divide-y divide-slate-50">
              {db.trialsExpiringSoon.map(u => {
                const d = daysLeft(u.trialEndsAt)
                return (
                  <div key={u.email} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm text-slate-800 font-medium">{u.displayName || '(no name)'}</p>
                      <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d}d left
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── Platform snapshot ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Platform snapshot</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Public stories', value: db.publicStoryCount, icon: <Globe size={16} />, accent: 'bg-green-100 text-green-700' },
            { label: 'Private stories', value: db.privateStoryCount, icon: <BookOpen size={16} />, accent: 'bg-slate-100 text-slate-600' },
            { label: 'Avg stories / subscriber', value: db.avgStoriesPerActiveUser ?? 0, icon: <TrendingUp size={16} />, accent: 'bg-blue-100 text-blue-700', decimal: true },
            { label: 'Publish rate', value: totalStories > 0 ? Math.round((db.publicStoryCount / totalStories) * 100) : 0, icon: <Share2 size={16} />, accent: 'bg-violet-100 text-violet-700', suffix: '%' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.accent}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stat.decimal ? Number(stat.value).toFixed(1) : stat.value.toLocaleString()}{stat.suffix ?? ''}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social content suggestions ───────────────────────────────────────── */}
      {db.recentPublicStories.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Content to share on social media
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Share2 size={13} className="text-violet-500" />
              <span className="text-xs font-semibold text-slate-600">Recent public stories — click "Copy post" to get a ready-to-post caption</span>
            </div>
            <div className="divide-y divide-slate-50">
              {db.recentPublicStories.map(story => (
                <div key={story.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{story.title}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{story.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CopyPostButton story={story} />
                    {story.shareToken && (
                      <a
                        href={`/s/${story.shareToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        Preview <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Google Analytics ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Google Analytics (last 30 days)</h2>
          {ga.configured && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 size={12} /> Connected
            </span>
          )}
        </div>

        {!ga.configured ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Settings size={18} className="text-amber-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 mb-1">Set up Google Analytics integration</p>
                <p className="text-sm text-slate-500 mb-3">
                  Connect a GA service account to see feature usage, traffic sources, and active user trends directly in this dashboard.
                </p>
                <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside mb-4">
                  <li>In Google Cloud Console, create a Service Account and download its JSON key</li>
                  <li>In Google Analytics, grant the service account <strong>Viewer</strong> access to your property</li>
                  <li>Find your numeric Property ID in GA → Admin → Property Settings</li>
                  <li>Add to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env.local</code>:</li>
                </ol>
                <pre className="bg-slate-900 text-slate-300 text-xs rounded-lg px-4 py-3 overflow-x-auto">
{`GA_PROPERTY_ID=123456789
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active user stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active users (7d)', value: ga.activeUsers7d ?? 0, icon: <Zap size={16} />, accent: 'bg-green-100 text-green-700' },
                { label: 'Active users (28d)', value: ga.activeUsers28d ?? 0, icon: <Users size={16} />, accent: 'bg-blue-100 text-blue-700' },
                { label: 'New users (14d)', value: ga.newUsers14d ?? 0, icon: <UserPlus size={16} />, accent: 'bg-violet-100 text-violet-700' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.accent}`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Feature usage */}
              {ga.topEvents && ga.topEvents.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={15} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Feature usage</h3>
                    <span className="text-xs text-slate-400">event count</span>
                  </div>
                  <div className="space-y-2.5">
                    {ga.topEvents.map(e => (
                      <BarRow key={e.name} label={e.label} value={e.count} max={maxEvent} />
                    ))}
                  </div>
                </div>
              )}

              {/* Traffic sources */}
              {ga.topSources && ga.topSources.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={15} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Traffic sources</h3>
                    <span className="text-xs text-slate-400">sessions</span>
                  </div>
                  <div className="space-y-2.5">
                    {ga.topSources.map(s => (
                      <BarRow key={s.source} label={s.source} value={s.sessions} max={maxSource} color="bg-blue-500" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
